package repository

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"fmt"
	"strings"

	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/genai"
)

type AiPlannerRepository interface {
	HandleAiPlanner(ctx context.Context, data model.AiPlannerReqBody) (*model.AiPlanner, error)
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
			"%d. Task: %s | Priority: %s | Done: %t\n",
			i+1, t.Task, t.Priority, t.Done,
		)
	}

	todoText := builder.String()

	prompt := fmt.Sprintf(`
		You are an AI Daily Planner Of TaskPlexus. 
		Create a timeline plan for today ONLY from the provided tasks. 
		Use priority, estimated_minutes, and deadlines to decide task order and timing.

		Tasks:
		%s

		User Context:
		%s

		Rules:
		- Always start the day at 09:00.
		- Fill tasks sequentially based on estimated_minutes.
		- Do NOT include tasks not in the input.
		- Always output valid JSON. No explanations.

		Return only this JSON format:

		{
		"date": "...",
		"plan": [
			{
			"taskId": "...",
			"title": "...",
			"startTime": "HH:MM",
			"endTime": "HH:MM",
			"priority": "..."
			}
		],
		"summary": "..."
		}

	`, todoText, data.Context)

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

	var planResponse model.AiPlannerLLMResponse
	if err := json.Unmarshal([]byte(responseText), &planResponse); err != nil {
		return nil, err
	}

	insert := model.AiPlanner{
		ID:          primitive.NewObjectID(),
		UserID:      userOid,
		WorkspaceId: workspaceOid,
		Date:        planResponse.Date,
		Context:     data.Context,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
		Plan:        planResponse.Plan,
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

func NewAiPlannerRepository(aiPlannerCollection *mongo.Collection, todoCollection *mongo.Collection, goalCollection *mongo.Collection) AiPlannerRepository {
	return &aiPlannerRepository{
		aiPlannerCollection: aiPlannerCollection,
		goalCollection:      goalCollection,
		todoCollection:      todoCollection,
	}
}
