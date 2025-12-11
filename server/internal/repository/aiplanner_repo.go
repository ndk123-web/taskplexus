package repository

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"
	"time"

	"fmt"
	"strings"

	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
	"google.golang.org/genai"
)

type AiPlannerRepository interface {
	HandleAiPlanner(ctx context.Context, data model.AiPlannerReqBody) (*model.AiPlanner, error)
	GetAiPlannerById(ctx context.Context, id string) (*model.AiPlanner, error)
	GetAllAiPlanners(ctx context.Context, userId string, workspaceId string, page string, limit string) ([]model.GetAllAiPlannerResponse, error, int64)
}

type aiPlannerRepository struct {
	aiPlannerCollection *mongo.Collection
	todoCollection      *mongo.Collection
	goalCollection      *mongo.Collection
}

func (r *aiPlannerRepository) HandleAiPlanner(ctx context.Context, data model.AiPlannerReqBody) (*model.AiPlanner, error) {
	if data.UserId == "" || data.WorkspaceId == "" {
		return nil, errors.New("UserId/WorkspaceId Can't Be Empty")
	}

	userOid, err := primitive.ObjectIDFromHex(data.UserId)
	if err != nil {
		return nil, err
	}
	workspaceOid, err := primitive.ObjectIDFromHex(data.WorkspaceId)
	if err != nil {
		return nil, err
	}

	// Query Mongo using ObjectIDs to match stored document types
	filter := bson.M{"userId": userOid, "workspaceId": workspaceOid}
	var todos []model.Todo

	cursor, err := r.todoCollection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	for cursor.Next(ctx) {
		var todo model.Todo
		if err := cursor.Decode(&todo); err != nil {
			return nil, err
		}
		todos = append(todos, todo)
	}

	// Build Prompt
	var builder strings.Builder

	for i, t := range todos {
		fmt.Fprintf(&builder,
			"%d. Task: %s | Priority: %s | Done: %t | Description: %s | Estimated Time (Minutes): %v | Deadline: %s \n",
			i+1, t.Task, t.Priority, t.Done, t.Description, *t.EstimatedTime, t.Deadline,
		)
	}

	todoText := builder.String()

	prompt := fmt.Sprintf(`
		You are a Professional Time Management & Productivity Planner for TaskPlexus.

		Your job:
		Create a realistic, human-friendly timeline for TODAY based on the provided tasks, user context, and productivity principles.

		Tasks:
		%s

		User Context:
		%s

		Rules:
		1. Day starts at 09:00 unless user context says otherwise.
		2. Include important natural breaks — short breaks, lunch, mental reset periods.
		3. Consider human energy cycles:
		- High focus tasks earlier in the day
		- Lighter tasks later
		4. Use task priority, estimated_minutes, and urgency to decide ordering.
		5. Suggest improvements if the user can boost productivity.
		6. Do NOT invent new tasks, but you *may* insert:
		- "Break"
		- "Lunch"
		- "Stretch"
		- "Planning / Review"
		7. Always output valid JSON only. No explanations.

		Return JSON ONLY in this exact format:

		{
		"date": "...",
		"plan": [
			{
			"taskId": "...",
			"title": "...",      // Break/Lunch allowed
			"startTime": "HH:MM",
			"endTime": "HH:MM",
			"priority": "..."    // For break/lunch use "none"
			}
		],
		"summary": "..."
		}
	`, todoText, data.Context)

	fmt.Println("Ai Planner Prompt: ", prompt)

	client, err := genai.NewClient(context.Background(), nil)
	if err != nil {
		return nil, err
	}

	response, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.5-flash",
		genai.Text(prompt),
		nil,
	)
	if err != nil {
		return nil, err
	}

	fmt.Println("Ai Planner Response: ", response.Text())

	responseText := response.Text()

	clean := strings.TrimSpace(responseText)
	clean = strings.TrimPrefix(clean, "```json")
	clean = strings.TrimPrefix(clean, "```JSON")
	clean = strings.TrimPrefix(clean, "```")
	clean = strings.TrimSuffix(clean, "```")
	clean = strings.TrimSpace(clean)

	fmt.Println("CLEANED JSON:", clean)

	var planResponse model.AiPlannerLLMResponse
	if err := json.Unmarshal([]byte(clean), &planResponse); err != nil {
		return nil, err
	}

	insert := model.AiPlanner{
		ID:          primitive.NewObjectID(),
		UserID:      userOid,
		WorkspaceId: workspaceOid,
		Date:        time.Now().Format("2006-01-02"), // why 2006-01-02 bc go time format
		Context:     data.Context,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Plan:        planResponse.Plan,
		Summary:     planResponse.Summary,
	}

	inserted, err := r.aiPlannerCollection.InsertOne(ctx, insert)
	if err != nil {
		return nil, err
	}

	if oid, ok := inserted.InsertedID.(primitive.ObjectID); ok {
		insert.ID = oid
	}

	return &insert, nil
}

func (r *aiPlannerRepository) GetAiPlannerById(ctx context.Context, id string) (*model.AiPlanner, error) {
	if id == "" {
		return nil, errors.New("AiPlanner ID Can't Be Empty")
	}

	aiPlannerOid, err := primitive.ObjectIDFromHex(id)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"_id": aiPlannerOid}
	var aiPlanner model.AiPlanner
	err = r.aiPlannerCollection.FindOne(ctx, filter).Decode(&aiPlanner)
	if err != nil {
		return nil, err
	}

	return &aiPlanner, nil

}

func (r *aiPlannerRepository) GetAllAiPlanners(ctx context.Context, userId string, workspaceId string, page string, limit string) ([]model.GetAllAiPlannerResponse, error, int64) {
	if userId == "" || workspaceId == "" {
		return nil, errors.New("UserId/WorkspaceId Can't Be Empty"), 0
	}

	if page == "" {
		page = "1"
	}
	if limit == "" {
		limit = "7"
	}

	pageInt, err := strconv.Atoi(page)
	if err != nil {
		return nil, err, 0
	}
	limitInt, err := strconv.Atoi(limit)
	if err != nil {
		return nil, err, 0
	}

	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err, 0
	}

	workspaceOid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil {
		return nil, err, 0
	}

	filter := bson.M{"userId": userOid, "workspace": workspaceOid}
	var aiPlanners []model.GetAllAiPlannerResponse

	count, err := r.aiPlannerCollection.CountDocuments(ctx, filter)
	if err != nil {
		return nil, err, 0
	}

	cursor, err := r.aiPlannerCollection.Find(ctx, filter, options.Find().SetSort(bson.D{{"createdAt", -1}}).SetProjection(bson.M{"summary": 1, "_id": 1, "date": 1}).SetSkip(int64((pageInt-1)*limitInt)).SetLimit(int64(limitInt)))
	if err != nil {
		return nil, err, 0
	}

	for cursor.Next(ctx) {
		var aiPlanner model.GetAllAiPlannerResponse
		if err := cursor.Decode(&aiPlanner); err != nil {
			return nil, err, 0
		}
		aiPlanners = append(aiPlanners, aiPlanner)
	}

	return aiPlanners, nil, count
}

func NewAiPlannerRepository(aiPlannerCollection *mongo.Collection, todoCollection *mongo.Collection, goalCollection *mongo.Collection) AiPlannerRepository {
	return &aiPlannerRepository{
		aiPlannerCollection: aiPlannerCollection,
		goalCollection:      goalCollection,
		todoCollection:      todoCollection,
	}
}
