// Package repository handles data access layer operations for todos
package repository

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type TodoRepository interface {
	GetAll(ctx context.Context) ([]model.Todo, error)
	CreateTodo(ctx context.Context, todo model.Todo, workspaceId string, userId string) (model.Todo, error)
	UpdateTodo(ctx context.Context, todoId string, updatedTask string, priority string) (model.Todo, error)
	DeleteTodo(ctx context.Context, todoId string) (bool, error)
	GetSpecificTodo(ctx context.Context, workspaceId string, userId string) ([]model.Todo, error)
	ToggleTodo(ctx context.Context, todoId string, toggle string, userId string) (bool, error)
	AnalyticsOfTodos(ctx context.Context, year string, userId string, workspaceId string) (any, error)
}

// todoRepo implements TodoRepository with MongoDB as the data store
type todoRepo struct {
	collection *mongo.Collection // MongoDB collection for todos
}

// GetAll retrieves all todo items from the database
func (r *todoRepo) GetAll(ctx context.Context) ([]model.Todo, error) {
	cursor, err := r.collection.Find(ctx, bson.D{})

	if err != nil {
		return nil, err
	}

	// in the end close the curson
	defer cursor.Close(ctx)

	// result will be here
	var todos []model.Todo

	// loop over the response
	for cursor.Next(ctx) {
		var todo model.Todo
		if err := cursor.Decode(&todo); err != nil {
			return nil, err
		}

		// append todos
		todos = append(todos, todo)
	}

	return todos, nil
}

func (r *todoRepo) ToggleTodo(ctx context.Context, todoId, toggle, userId string) (bool, error) {
	if todoId == "" || toggle == "" || userId == "" {
		return false, errors.New("missing required fields: todoId/toggle/userId")
	}

	fmt.Println("TodoId: ", todoId)
	fmt.Println("Toggle: ", toggle)
	fmt.Println("UserId: ", userId)

	todoOid, err := primitive.ObjectIDFromHex(todoId)
	if err != nil {
		return false, err
	}
	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return false, err
	}

	// determine bool value from toggle
	var doneValue bool
	switch toggle {
	case "completed":
		doneValue = true
	case "not-started":
		doneValue = false
	default:
		return false, errors.New("invalid toggle value")
	}

	filter := bson.M{"_id": todoOid, "userId": userOid}
	update := bson.M{"$set": bson.M{"done": doneValue}}

	updated, err := r.collection.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}

	if updated.ModifiedCount == 0 {
		return false, errors.New("no todo found for update")
	}

	return true, nil
}

// CreateTodo adds a new todo item to the database
func (r *todoRepo) CreateTodo(ctx context.Context, todo model.Todo, workspaceId string, userId string) (model.Todo, error) {
	if todo.Task == "" {
		return model.Todo{}, errors.New("Task is Invalid / Empty")
	}

	// string -> object Id
	workspaceOid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil {
		return model.Todo{}, err
	}
	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return model.Todo{}, err
	}

	todo.WorkspaceId = workspaceOid
	todo.UserId = userOid
	todo.CreatedAt = time.Now()
	todo.UpdatedAt = time.Now()

	insertedId, err := r.collection.InsertOne(ctx, todo)
	if err != nil {
		return model.Todo{}, err
	}

	todo.ID = insertedId.InsertedID.(primitive.ObjectID)

	return todo, nil
}

// UpdateTodo modifies an existing todo's task text
func (r *todoRepo) UpdateTodo(ctx context.Context, todoId string, updatedTask string, priority string) (model.Todo, error) {
	if todoId == "" {
		return model.Todo{}, errors.New("Todo Id is Empty")
	}

	// convert the string id to object Id
	oid, err2 := primitive.ObjectIDFromHex(todoId)

	if err2 != nil {
		return model.Todo{}, err2
	}

	// always convert string -> object id
	filter := bson.M{"_id": oid}
	update := bson.M{"$set": bson.M{"task": updatedTask, "priority": priority}}

	_, err := r.collection.UpdateOne(ctx, filter, update)

	if err != nil {
		return model.Todo{}, err
	}

	// find the todo
	var updatedTodo model.Todo
	err3 := r.collection.FindOne(ctx, filter).Decode(&updatedTodo)

	if err3 != nil {
		return model.Todo{}, err
	}

	return updatedTodo, nil
}

// DeleteTodo removes a todo item by its ID
func (r *todoRepo) DeleteTodo(ctx context.Context, todoId string) (bool, error) {

	// string -> ObjectId
	oid, err := primitive.ObjectIDFromHex(todoId)
	if err != nil {
		return false, err
	}

	// filter with Object ID
	filter := bson.M{"_id": oid}

	// filter and delete Document
	_, err2 := r.collection.DeleteOne(ctx, filter)
	if err2 != nil {
		return false, err
	}

	return true, nil
}

func (r *todoRepo) GetSpecificTodo(ctx context.Context, workspaceId string, userId string) ([]model.Todo, error) {
	// convert workspaceId and UserId into object
	workspaceOid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil {
		return nil, err
	}
	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err
	}

	// filter the documents
	filter := bson.M{"workspaceId": workspaceOid, "userId": userOid}
	cursor, err := r.collection.Find(ctx, filter)

	// otherwise cursor remains open and can cause memory leaks
	defer cursor.Close(ctx)

	if err != nil {
		return nil, err
	}

	// get into the todos
	var todos []model.Todo
	for cursor.Next(ctx) {
		var todo model.Todo
		if err := cursor.Decode(&todo); err != nil {
			return nil, err
		}
		todos = append(todos, todo)
	}

	// return todos and nil as no error
	return todos, nil
}

func (r *todoRepo) AnalyticsOfTodos(ctx context.Context, year string, userId string, workspaceId string) (any, error) {
	if year == "" || userId == "" {
		return nil, errors.New("Year / UserId is Empty in Repo")
	}

	// convert userId into ObjectId
	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err
	}

	workspaceOid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil && workspaceId != "" {
		return nil, err
	}

	// Parse the year
	yearInt := 0
	fmt.Sscanf(year, "%d", &yearInt)
	if yearInt < 2020 || yearInt > 2030 {
		return nil, errors.New("invalid year range")
	}

	// Create start and end dates for the year
	startDate := time.Date(yearInt, 1, 1, 0, 0, 0, 0, time.UTC)
	endDate := time.Date(yearInt+1, 1, 1, 0, 0, 0, 0, time.UTC)

	// Filter by userId, workspaceId, and year range
	filter := bson.M{
		"userId": userOid,
		"done":   true, // Only count completed todos
		"createdAt": bson.M{
			"$gte": startDate,
			"$lt":  endDate,
		},
	}

	// Add workspaceId filter if provided (workspace must match)
	if workspaceId != "" {
		filter["workspaceId"] = workspaceOid
		fmt.Printf("🏢 Analytics: Filtering by workspace: %s\n", workspaceId)
	}

	fmt.Printf("🔍 Analytics filter: %+v\n", filter)
	fmt.Printf("📅 Date range: %s to %s\n", startDate.Format("2006-01-02"), endDate.Format("2006-01-02"))

	cursor, err := r.collection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	// Count todos by month
	monthlyCounts := make(map[int]int)
	for i := 1; i <= 12; i++ {
		monthlyCounts[i] = 0
	}

	totalFound := 0
	for cursor.Next(ctx) {
		var todo model.Todo
		if err := cursor.Decode(&todo); err != nil {
			continue
		}
		month := int(todo.CreatedAt.Month())
		monthlyCounts[month]++
		totalFound++
		fmt.Printf("📋 Found completed todo: %s (Month: %d, Created: %s)\n", todo.Task, month, todo.CreatedAt.Format("2006-01-02"))
	}

	fmt.Printf("📊 Analytics Summary - Total found: %d completed todos for year %s\n", totalFound, year)
	fmt.Printf("📈 Monthly breakdown: %+v\n", monthlyCounts)

	// Format response as required by frontend
	monthNames := []string{"Jan", "Feb", "Mar", "Apr", "May", "Jun",
		"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"}
	monthLabels := []string{"January", "February", "March", "April", "May", "June",
		"July", "August", "September", "October", "November", "December"}

	result := make([]map[string]interface{}, 12)
	for i := 0; i < 12; i++ {
		result[i] = map[string]interface{}{
			"month":     monthNames[i],
			"completed": monthlyCounts[i+1],
			"label":     monthLabels[i],
		}
	}

	return result, nil
}

// NewTodoRepository creates and returns a new instance of TodoRepository
// It initializes the MongoDB collection for todo operations
func NewTodoRepository(col *mongo.Collection) TodoRepository {
	return &todoRepo{
		collection: col,
	}
}
