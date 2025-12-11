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

type GoalRepository interface {
	GetUserGoals(ctx context.Context, userId string, workspaceId string) ([]model.Goals, error)
	CreateUserGoal(ctx context.Context, userId string, workspaceId string, goalName string, targetDays int64, category string) (model.Goals, error)
	UpdateUserGoal(ctx context.Context, goalId string, updatedGoalName string, updatedTargetDays int64, updatedCategory string, description string, deadline string) (bool, error)
	DeleteUserGoal(ctx context.Context, goalId string) (bool, error)
	IncreamentGoalProgress(ctx context.Context, goalId string, count int64) (bool, error)
	DecreamentGoalProgress(ctx context.Context, goalId string, count int64) (bool, error)
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
		// create the new ObjectId
		ID:          primitive.NewObjectID(),
		UserId:      userOid,
		WorkspaceId: workspaceOid,
		TargetDays:  int(targetDays),
		Title:       goalName,
		Category:    category,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	insertedRes, err := r.goalCollection.InsertOne(ctx, insert)
	if err != nil {
		return model.Goals{}, err
	}

	// inject the objectId with response
	if oid, ok := insertedRes.InsertedID.(primitive.ObjectID); ok {
		insert.ID = oid
	}

	return insert, nil
}

func (r *goalRepository) UpdateUserGoal(ctx context.Context, goalId string, updatedGoalName string, updatedTargetDays int64, updatedCategory string, description string, deadline string) (bool, error) {
	if goalId == "" {
		return false, errors.New("Goal ID is Empty in Repo")
	}

	// convert goalId string -> objectId
	oid, err := primitive.ObjectIDFromHex(goalId)
	if err != nil {
		return false, err
	}

	filter := bson.M{"_id": oid}
	update := bson.M{"$set": bson.M{"title": updatedGoalName, "targetDays": updatedTargetDays, "category": updatedCategory, "updatedAt": time.Now(), "description": description, "deadline": deadline}}

	updated, err := r.goalCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}

	if updated.MatchedCount == 0 {
		return false, errors.New("GoalId Document Not Found")
	}

	return true, nil
}

func (r *goalRepository) DeleteUserGoal(ctx context.Context, goalId string) (bool, error) {
	if goalId == "" {
		return false, errors.New("Goal Id is Empty in Repository")
	}

	// convert string -> ObjectId
	oid, err := primitive.ObjectIDFromHex(goalId)
	if err != nil {
		return false, err
	}

	filter := bson.M{"_id": oid}
	deletedRes, err := r.goalCollection.DeleteOne(ctx, filter)
	if err != nil {
		return false, err
	}

	if deletedRes.DeletedCount == 0 {
		return false, errors.New("Documents Not Found")
	}

	return true, nil
}

func (r *goalRepository) IncreamentGoalProgress(ctx context.Context, goalId string, count int64) (bool, error) {
	if goalId == "" {
		return false, errors.New("Goal Id is Empty in Repository")
	}

	// convert string -> ObjectId
	oid, err := primitive.ObjectIDFromHex(goalId)
	if err != nil {
		return false, err
	}

	filter := bson.M{"_id": oid}
	// Use atomic increment operation instead of find + update
	update := bson.M{"$inc": bson.M{"currentTarget": count}}

	fmt.Println("Count in Repo: ", count)

	updatedRes, err := r.goalCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}

	if updatedRes.MatchedCount == 0 {
		return false, errors.New("GoalId Document Not Found")
	}

	return true, nil
}

func (r *goalRepository) DecreamentGoalProgress(ctx context.Context, goalId string, count int64) (bool, error) {
	if goalId == "" {
		return false, errors.New("Goal Id is Empty in Repository")
	}

	// convert string -> ObjectId
	oid, err := primitive.ObjectIDFromHex(goalId)
	if err != nil {
		return false, err
	}

	filter := bson.M{"_id": oid}
	update := bson.M{"$inc": bson.M{"currentTarget": -count}}

	updatedRes, err := r.goalCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}

	if updatedRes.MatchedCount == 0 {
		return false, errors.New("GoalId Document Not Found")
	}

	return true, nil
}

func NewGoalRepository(goalCollection *mongo.Collection) GoalRepository {
	return &goalRepository{
		goalCollection: goalCollection,
	}
}
