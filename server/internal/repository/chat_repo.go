package repository

import (
	"context"
	"errors"
	"fmt"

	// "github.com/ndk123-web/fast-todo/internal/middleware"
	"strings"

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

	filter := bson.M{"userId": userOid, "workspaceId": workspaceOid}
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
		fmt.Fprintf(&builder,
			"%d. Task: %s | Priority: %s | Done: %t | Description: %s | Estimation (Minutes): %v | Deadline: %s\n",
			i+1, t.Task, t.Priority, t.Done, t.Description, *t.EstimatedTime, t.Deadline,
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
