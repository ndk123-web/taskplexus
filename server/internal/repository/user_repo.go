package repository

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type UserRepository interface {
	GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error)
	// login
	// logout
}

type userRepo struct {
	todoCollection *mongo.Collection
	userColletion  *mongo.Collection
}

func (r *userRepo) GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error) {

	if userId == "" {
		return []model.Todo{}, errors.New("UserId Cant Be Empty")
	}

	// convert the string -> Object ID
	oid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return []model.Todo{}, err
	}

	// create the filter
	filter := bson.M{"_id": oid}

	cursor, err2 := r.todoCollection.Find(ctx, filter)
	if err2 != nil {
		return []model.Todo{}, err2
	}

	// in the end free the resources 
	defer cursor.Close(ctx)

	// result array
	var userTodos []model.Todo

	// loop over response cursor 
	for cursor.Next(ctx) {
		var userTodo model.Todo
		if err := cursor.Decode(&userTodo); err != nil {
			return []model.Todo{}, err
		}

		// append answers 
		userTodos = append(userTodos, userTodo)
	}

	return userTodos, nil
}

func NewUserRepository(todoCol *mongo.Collection, userCol *mongo.Collection) UserRepository {
	return &userRepo{
		todoCollection: todoCol,
		userColletion:  userCol,
	}
}
