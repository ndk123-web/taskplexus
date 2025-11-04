package repository

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
)

// Its Interface
// Any Struct Implementing GetAll can return this as interface
type TodoRepository interface {
	GetAll(ctx context.Context) ([]model.Todo, error)
	CreateTodo(ctx context.Context, todo model.Todo) (model.Todo, error)
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

	_, err := r.collection.InsertOne(ctx, todo)
	if err != nil {
		return model.Todo{}, err
	}
	return todo, nil
}

// the return type is TodoRepository (Interface) its because
// the todoRepo actually is struct which is performing all the function inside the TodoRepsoitory Interface
func NewTodoRepository(col *mongo.Collection) TodoRepository {
	return &todoRepo{
		collection: col,
	}
}
