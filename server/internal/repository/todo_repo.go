package repository

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// Its Interface
// Any Struct Implementing GetAll can return this as interface
type TodoRepository interface {
	GetAll(ctx context.Context) ([]model.Todo, error)
	CreateTodo(ctx context.Context, todo model.Todo) (model.Todo, error)
	UpdateTodo(ctx context.Context, todoId string, updatedTask string) (model.Todo, error)
	DeleteTodo(ctx context.Context, todoId string) (bool, error)
}

type todoRepo struct {
	collection *mongo.Collection
}

func (r *todoRepo) GetAll(ctx context.Context) ([]model.Todo, error) {
	cursor, err := r.collection.Find(ctx, bson.D{})

	if err != nil {
		return nil, err
	}

	// in the end close the curson
	defer cursor.Close(ctx)

	var todos []model.Todo

	for cursor.Next(ctx) {
		var todo model.Todo
		if err := cursor.Decode(&todo); err != nil {
			return nil, err
		}

		todos = append(todos, todo)
	}

	return todos, nil
}

func (r *todoRepo) CreateTodo(ctx context.Context, todo model.Todo) (model.Todo, error) {
	if todo.Task == "" {
		return model.Todo{}, errors.New("Task is Invalid / Empty")
	}

	insertedId, err := r.collection.InsertOne(ctx, todo)
	if err != nil {
		return model.Todo{}, err
	}

	todo.ID = insertedId.InsertedID.(primitive.ObjectID)
	return todo, nil
}

func (r *todoRepo) UpdateTodo(ctx context.Context, todoId string, updatedTask string) (model.Todo, error) {
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
	update := bson.M{"$set": bson.M{"task": updatedTask}}

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

func (r *todoRepo) DeleteTodo(ctx context.Context, todoId string) (bool, error) {
   
    // string -> ObjectId 
	oid, err := primitive.ObjectIDFromHex(todoId)
	if err != nil {
		return false, err
	}

	// filter with Object ID 
	filter := bson.M{"_id": oid}
    
	// filter and delete Document 
	_ , err2 := r.collection.DeleteOne(ctx,filter)
    if err2 != nil {
		return false,err
	}
    
	return true , nil
}

// the return type is TodoRepository (Interface) its because
// the todoRepo actually is struct which is performing all the function inside the TodoRepsoitory Interface
func NewTodoRepository(col *mongo.Collection) TodoRepository {
	return &todoRepo{
		collection: col,
	}
}
