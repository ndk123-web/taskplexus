// Package repository handles data access layer operations for todos
package repository

import (
	"context"
	"errors"
	"fmt"
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

// NewTodoRepository creates and returns a new instance of TodoRepository
// It initializes the MongoDB collection for todo operations
func NewTodoRepository(col *mongo.Collection) TodoRepository {
	return &todoRepo{
		collection: col,
	}
}
