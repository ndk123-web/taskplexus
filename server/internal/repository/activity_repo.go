package repository

import (
	"context"
	"go.mongodb.org/mongo-driver/mongo"
)

type ActivityRepository interface {
	HandleActivityEvent(ctx context.Context, data any) (any, error)
}

type activityRepository struct {
	goalCollection     *mongo.Collection
	todoCollection     *mongo.Collection
	activityCollection *mongo.Collection
}

func (r *activityRepository) HandleActivityEvent(ctx context.Context, data any) (any, error) {
	return nil, nil
}

func NewActivityRepository(goal *mongo.Collection, todo *mongo.Collection, activity *mongo.Collection) ActivityRepository {
	return &activityRepository{
		goalCollection:     goal,
		todoCollection:     todo,
		activityCollection: activity,
	}
}
