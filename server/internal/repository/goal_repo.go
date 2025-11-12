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
	GetUserGoals(ctx context.Context, userId string, workspaceId string) ([]model.Goals, error)
	CreateUserGoal(ctx context.Context, userId string, workspaceId string, goalName string, targetDays int64, category string) (model.Goals, error)
}

type goalRepository struct {
	goalCollection *mongo.Collection
}

func (r *goalRepository) GetUserGoals(ctx context.Context, userId string, workspaceId string) ([]model.Goals, error) {
	var err error

	if userId == "" {
		return nil, errors.New("UserId is Empty")
	}

	// convert userId and WorkspaceId from string -> ObjectId
	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err
	}
	workspaceOid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil {
		return nil, err
	}

	// filter
	filter := bson.M{"userId": userOid, "workspaceId": workspaceOid}

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

func (r *goalRepository) CreateUserGoal(ctx context.Context, userId string, workspaceId string, goalName string, targetDays int64, category string) (model.Goals, error) {
	if userId == "" || workspaceId == "" {
		return model.Goals{}, errors.New("UserId / WorkspaceId is Empty in Repo")
	}

	// convert string -> ObjectId
	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return model.Goals{}, err
	}
	workspaceOid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil {
		return model.Goals{}, err
	}

	insert := model.Goals{
		ID:          primitive.NewObjectID(),
		UserId:      userOid,
		WorkspaceId: workspaceOid,
		TargetDays:  int(targetDays),
		Title:       goalName,
		Category:    category,
	}

	insertedRes, err := r.goalCollection.InsertOne(ctx, insert)
	if err != nil {
		return model.Goals{}, err
	}

	if oid, ok := insertedRes.InsertedID.(primitive.ObjectID); ok {
		insert.ID = oid
	}

	return insert, nil
}

func NewGoalRepository(goalCollection *mongo.Collection) GoalRepository {
	return &goalRepository{
		goalCollection: goalCollection,
	}
}
