package repository

import (
	"context"
	"errors"

	"time"

	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type ActivityRepository interface {
	HandleActivityEvent(ctx context.Context, data model.HandleActivityBody) (any, error)
}

type activityRepository struct {
	goalCollection     *mongo.Collection
	todoCollection     *mongo.Collection
	activityCollection *mongo.Collection
}

func (r *activityRepository) HandleActivityEvent(ctx context.Context, data model.HandleActivityBody) (any, error) {
	var insert model.Activity

	// Validate activity type is not empty and is one of the valid types
	if data.Type == "" {
		return nil, errors.New("Activity Type Is Invalid")
	}

	// Check if the type is one of the valid ActivityType constants
	validTypes := map[model.ActivityType]bool{
		model.ActivityTaskCompleted: true,
		model.ActivityTaskCreated:   true,
		model.ActivityGoalCompleted: true,
		model.ActivityGoalCreated:   true,
	}

	if !validTypes[data.Type] {
		return nil, errors.New("Activity Type Is Invalid")
	}

	insert.Type = data.Type

	id, err := primitive.ObjectIDFromHex(data.Metadata.Id)
	if err != nil {
		return nil, err
	}

	workspaceOid, err := primitive.ObjectIDFromHex(data.Metadata.WorkspaceId)
	if err != nil {
		return nil, err
	}

	insert.Metadata.Id = id
	insert.Metadata.WorkspaceId = workspaceOid
	insert.Metadata.Name = data.Metadata.Name
	insert.TimeStamp = time.Now()
	insert.ID = primitive.NewObjectID()

	result, err := r.activityCollection.InsertOne(ctx, insert)
	if err != nil {
		return nil, err
	}

	if oid, ok := result.InsertedID.(primitive.ObjectID); ok {
		insert.ID = oid
	}

	return insert, nil
}

func NewActivityRepository(goal *mongo.Collection, todo *mongo.Collection, activity *mongo.Collection) ActivityRepository {
	return &activityRepository{
		goalCollection:     goal,
		todoCollection:     todo,
		activityCollection: activity,
	}
}
