package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	// "github.com/ndk123-web/fast-todo/internal/middleware"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/genai"
)

type ChatRepository interface {
	HandleAiMessage(ctx context.Context, prompt string, workspaceId string, userId string) (*model.Chat, error)
	GetUserAiMessage(ctx context.Context, userId string, workspaceId string) ([]model.Chat, error)
}

type chatRepository struct {
	// collections
	todoCollection      *mongo.Collection
	workspaceCollection *mongo.Collection
	goalCollection      *mongo.Collection
	chatCollection      *mongo.Collection
}

func (r *chatRepository) HandleAiMessage(ctx context.Context, userPrompt string, workspaceId string, userId string) (*model.Chat, error) {
	// userId := ctx.Value(middleware.UserId).(string)
	// fmt.Println("UserId: ", userId)

	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err
	}

	workspaceOid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil {
		return nil, err
	}

	// Check Is User Has Subscription
	query := "SELECT plan_name, is_active FROM subscriptions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1"
	var plan_name string
	var is_active bool
	err = config.PostgresPool.QueryRow(ctx, query, userId).Scan(&plan_name, &is_active)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// do not do anything it means user has no subscription
			plan_name = "FREE"
		} else {
			return nil, err
		}
	}

	if plan_name == "" {
		return nil, errors.New("Please Subscribe to a Plan to Use AI Features")
	}

	// Check Usage Limits Based on Plan
	var filter bson.M

	switch plan_name {
	case "FREE":
		filter = bson.M{"userId": userOid, "workspaceId": workspaceOid}
		// first count the chats to check the limit
		count, err := r.chatCollection.CountDocuments(ctx, filter)
		if err != nil {
			return nil, err
		}

		if plan_name == "FREE" && count >= 5 {
			return nil, errors.New("LIMIT REACHED")
		}
	case "PRO_MONTHLY":

		// check today's count
		today := time.Now().Format("2006-01-02")

		filter = bson.M{"userId": userOid, "workspaceId": workspaceOid, "date": today}
		// first count the chats to check the limit
		count, err := r.chatCollection.CountDocuments(ctx, filter)
		if err != nil {
			return nil, err
		}

		if plan_name == "PRO_MONTHLY" && count >= 100 {
			return nil, errors.New("LIMIT REACHED")
		}
	default:
		return nil, errors.New("Unable to determine user subscription plan")
	}

	filter = bson.M{"userId": userOid, "workspaceId": workspaceOid}
	cursor, err := r.todoCollection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	var todos []model.Todo
	for cursor.Next(ctx) {
		var todo model.Todo
		if err := cursor.Decode(&todo); err != nil {
			return nil, err
		}
		todos = append(todos, todo)
	}

	var builder strings.Builder

	for i, t := range todos {
		var estimatedTime int
		if t.EstimatedTime != nil {
			estimatedTime = *t.EstimatedTime
		}
		fmt.Fprintf(&builder,
			"%d. Task: %s | Priority: %s | Done: %t | Description: %s | Estimation (Minutes): %v | Deadline: %s\n",
			i+1, t.Task, t.Priority, t.Done, t.Description, estimatedTime, t.Deadline,
		)
	}

	todosText := builder.String()

	prompt := fmt.Sprintf(`
		You are an advisor for the TaskPlexus application.
		Your job is to respond to the user's prompt and give direct, practical suggestions.

		User Prompt:
		%s

		User Todos:
		%s

		Provide clear, structured, and actionable guidance based only on the information above.
		`, userPrompt, todosText)

	fmt.Println(prompt)

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

	fmt.Println("Response: ", response.Text())

	// save response in db
	insert := model.Chat{
		Id:          primitive.NewObjectID(),
		WorkspaceId: workspaceOid,
		UserId:      userOid,
		Prompt:      userPrompt,
		Response:    response.Text(),
		CreatedAt:   primitive.NewDateTimeFromTime(time.Now()),
		UpdatedAt:   primitive.NewDateTimeFromTime(time.Now()),
		Date:        time.Now().Format("2006-01-02"),
	}

	inserted, err := r.chatCollection.InsertOne(ctx, insert)
	if err != nil {
		return nil, err
	}

	if oid, ok := inserted.InsertedID.(primitive.ObjectID); ok {
		insert.Id = oid
	}

	return &insert, nil
}

func (r *chatRepository) GetUserAiMessage(ctx context.Context, userId string, workspaceId string) ([]model.Chat, error) {
	if userId == "" || workspaceId == "" {
		return nil, errors.New("UserId/WorkspaceId are Missing")
	}

	workspaceOid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil {
		return nil, err
	}

	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"userId": userOid, "workspaceId": workspaceOid}
	cursor, err := r.chatCollection.Find(ctx, filter)

	if err != nil {
		return nil, err
	}

	var chats []model.Chat
	for cursor.Next(ctx) {
		var chat model.Chat
		if err := cursor.Decode(&chat); err != nil {
			return nil, err
		}
		chats = append(chats, chat)
	}

	return chats, nil
}

func NewChatRepository(todo *mongo.Collection, goal *mongo.Collection, workspace *mongo.Collection, chat *mongo.Collection) ChatRepository {
	return &chatRepository{
		todoCollection:      todo,
		goalCollection:      goal,
		workspaceCollection: workspace,
		chatCollection:      chat,
	}
}
