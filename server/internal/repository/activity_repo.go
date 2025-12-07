package repository

import (
	"context"
	"errors"

	"time"

	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type ActivityRepository interface {
	HandleActivityEvent(ctx context.Context, data model.HandleActivityBody) (any, error)
	GetActivities(ctx context.Context, data model.GetActivityData) ([]model.Activity, error)
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

func (r *activityRepository) GetActivities(ctx context.Context, data model.GetActivityData) ([]model.Activity, error) {
	if data.Filter == "" || data.Page == 0 || data.Limit == 0 || data.WorkspaceId == "" {
		return nil, errors.New("Get Activity Data is Invalid")
	}

	workspaceOid, err := primitive.ObjectIDFromHex(data.WorkspaceId)
	if err != nil {
		return nil, err
	}

	filter := bson.M{"metadata.workspaceId": workspaceOid}

	switch data.Filter {
	case "task":
		filter["activityType"] = bson.M{"$in": []string{"TASK_CREATED", "TASK_COMPLETED"}}

	case "goal":
		filter["activityType"] = bson.M{"$in": []string{"GOAL_CREATED", "GOAL_COMPLETED"}}
	}

	cursor, err := r.activityCollection.Find(ctx, filter, options.Find().
		SetSkip((data.Page-1)*data.Limit).
		SetLimit(data.Limit).
		SetSort(bson.M{"timestamp": -1}))

	if err != nil {
		return nil, err
	}

	var activities []model.Activity
	for cursor.Next(ctx) {
		var activity model.Activity
		if err := cursor.Decode(&activity); err != nil {
			return nil, err
		}
		activities = append(activities, activity)
	}

	return activities, nil
}

func NewActivityRepository(goal *mongo.Collection, todo *mongo.Collection, activity *mongo.Collection) ActivityRepository {
	return &activityRepository{
		goalCollection:     goal,
		todoCollection:     todo,
		activityCollection: activity,
	}
}
