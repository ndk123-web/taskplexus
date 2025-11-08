package repository

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type WorkSpaceRepository interface {
	GetAllUserWorkspace(ctx context.Context, userId string) ([]model.Workspace, error)
}

type workspaceRepository struct {
	workspaceCollection *mongo.Collection
}

func (r *workspaceRepository) GetAllUserWorkspace(ctx context.Context, userId string) ([]model.Workspace, error) {
	if userId == "" {
		return nil, errors.New("UserId in Repo is Empty")
	}
	// convert userId -> oid
	oid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err
	}

	// filter for finding only workspaces of user
	filter := bson.M{"userId": oid}

	// get the workspaces here
	cursor, err := r.workspaceCollection.Find(ctx, filter)
	if err != nil {
		return nil, err
	}

	// fetch workspaces
	var workspaces []model.Workspace
	for cursor.Next(ctx) {
		var workspace model.Workspace
		cursor.Decode(&workspace)
		workspaces = append(workspaces, workspace)
	}

	// finally return the workspaces
	return workspaces, nil
}
