package repository

import (
	"context"
	"errors"
	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type GoalRepository interface {
	GetUserGoals(ctx context.Context, userId string) ([]model.Goals, error)
}

type goalRepository struct {
	goalCollection *mongo.Collection
}

func (r *goalRepository) GetUserGoals(ctx context.Context, userId string) ([]model.Goals, error) {
	var err error

	if userId == "" {
		return nil, errors.New("UserId is Empty")
	}

	oid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err
	}
	filter := bson.M{"userId": oid}

	cursor, err := r.goalCollection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	var goalsDocs []model.Goals
	for cursor.Next(ctx) {
		var goal model.Goals
		if err := cursor.Decode(&goal); err != nil {
			return nil, err
		}
		goalsDocs = append(goalsDocs, goal)
	}

	return goalsDocs, nil
}

func NewGoalRepository(goalCollection *mongo.Collection) GoalRepository {
	return &goalRepository{
		goalCollection: goalCollection,
	}
}
