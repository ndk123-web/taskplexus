package repository

import (
	"context"
	"errors"

	"fmt"
	"time"

	"github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// WorkSpaceRepository interface
type WorkSpaceRepository interface {
	GetAllUserWorkspace(ctx context.Context, userId string) ([]model.Workspace, error)
	CreateWorkspace(ctx context.Context, userId string, workspaceName string) (string, error)
	UpdatedWorkspace(ctx context.Context, userId string, workspaceName string, updatedWorkspace string) error
	DeleteWorkspace(ctx context.Context, userId string, workspaceName string) error
	UpdateWorkspaceLayout(ctx context.Context, workspaceId string, nodes, edges []map[string]interface{}) (bool, error)
}

// workspaceRepository struct
type workspaceRepository struct {
	workspaceCollection *mongo.Collection
}

// GetAllUserWorkspace gets all workspaces for a user
func (r *workspaceRepository) GetAllUserWorkspace(ctx context.Context, userId string) ([]model.Workspace, error) {

	// validate userId
	if userId == "" {
		return nil, errors.New("UserId in Repo is Empty")
	}

	// convert userId -> oid
	oid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, err
	}

	// check the subscription status of user
	var plan string
	var start_date time.Time
	var end_date time.Time
	var is_active bool

	query := "SELECT plan_name, is_active, started_at, expires_at FROM subscriptions WHERE user_id = $1 AND is_active = true ORDER BY created_at DESC LIMIT 1"
	err = config.PostgresPool.QueryRow(ctx, query, userId).Scan(&plan, &is_active, &start_date, &end_date)

	if err != nil {
		plan = "FREE"
	}

	fmt.Println("Plan: ", plan)

	// Construct base pipeline
	pipeline := mongo.Pipeline{
		{
			{Key: "$match", Value: bson.D{
				{Key: "userId", Value: oid},
			}},
		},
		{
			{Key: "$lookup", Value: bson.D{
				{Key: "from", Value: "todos"},
				{Key: "localField", Value: "_id"},
				{Key: "foreignField", Value: "workspaceId"},
				{Key: "as", Value: "todos"},
			}},
		},
		{
			{Key: "$lookup", Value: bson.D{
				{Key: "from", Value: "goals"},
				{Key: "localField", Value: "_id"},
				{Key: "foreignField", Value: "workspaceId"},
				{Key: "as", Value: "goals"},
			}},
		},
		{
			{Key: "$sort", Value: bson.D{
				{Key: "createdAt", Value: 1},
			}},
		},
	}

	// if plan free then limit workspaces to 2
	if plan == "FREE" {
		pipeline = append(pipeline, bson.D{{Key: "$limit", Value: 2}})
	} else if plan == "PRO_MONTHLY" {
		pipeline = append(pipeline, bson.D{{Key: "$limit", Value: 10}})
	}

	cursor, err := r.workspaceCollection.Aggregate(ctx, pipeline)
	if err != nil {
		return nil, err
	}

	defer cursor.Close(ctx)

	var result []model.Workspace
	for cursor.Next(ctx) {
		var part model.Workspace
		if err := cursor.Decode(&part); err != nil {
			return nil, err
		}
		// fmt.Println("Part: ", part)
		result = append(result, part)
	}

	// finally return the workspaces
	return result, nil
}

type createWorkspaceInDb struct {
	UserId        primitive.ObjectID `json:"userId" bson:"userId"`
	WorkspaceName string             `json:"workspaceName" bson:"workspaceName"`
	CreatedAt     time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time          `bson:"updatedAt" json:"updatedAt"`
}

func (r *workspaceRepository) CreateWorkspace(ctx context.Context, userId string, workspaceName string) (string, error) {
	if userId == "" || workspaceName == "" {
		return "", errors.New("User Email / workspaceName is Empty in Repo")
	}

	// convert first string to objectId
	oid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return "", err
	}

	// check if workspace already exists for user
	filter := bson.M{"userId": oid, "workspaceName": workspaceName}
	res := r.workspaceCollection.FindOne(ctx, filter)

	// check for error
	err = res.Err()

	// if no error, workspace exists
	if err == nil {
		//  Document found → duplicate
		return "", errors.New("workspace already exists for this user")
	} else if !errors.Is(err, mongo.ErrNoDocuments) {
		// Some DB issue
		return "", err
	}

	// structure for stroring inside db
	insertDoc := createWorkspaceInDb{
		UserId:        oid,
		WorkspaceName: workspaceName,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	// insert inside db
	insertResult, err := r.workspaceCollection.InsertOne(ctx, insertDoc)
	if err != nil {
		return "", err
	}

	// InsertId is interface {} and .(primitive.ObjectId) it means inside that there is value in form of ObjectId and using .Hex() we conver Object id into Readable Hex String
	fmt.Println("Insert Result: ", insertResult.InsertedID.(primitive.ObjectID).Hex())
	stringInsertedId := insertResult.InsertedID.(primitive.ObjectID).Hex()
	return stringInsertedId, nil
}

func (r *workspaceRepository) UpdatedWorkspace(ctx context.Context, userId string, workspaceName string, updatedWorkspace string) error {
	if userId == "" || workspaceName == "" {
		return errors.New("UserId / Workspace name Empty")
	}

	// convert userId to oid
	oid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return err
	}

	// update the workspace name
	filter := bson.M{"userId": oid, "workspaceName": workspaceName}
	update := bson.M{"$set": bson.M{
		"workspaceName": updatedWorkspace,
		"updatedAt":     time.Now(),
	}}

	// perform the update
	res, err := r.workspaceCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return err
	}

	// check if any document was modified or not
	// if no document matched the filter, it means workspace doesn't exist
	if res.MatchedCount == 0 {
		return errors.New("No workspace found for given userId and workspaceName")
	}

	// debug
	fmt.Println("Updated Workspace Count:", res.ModifiedCount)

	// success
	return nil
}

func (r *workspaceRepository) DeleteWorkspace(ctx context.Context, userId string, workspaceName string) error {
	if userId == "" || workspaceName == "" {
		return errors.New("UserId / Workspace name Empty")
	}

	// convert userId to oid
	oid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return err
	}

	// filter for deletion
	filter := bson.M{"userId": oid, "workspaceName": workspaceName}

	// perform deletion
	res, err := r.workspaceCollection.DeleteOne(ctx, filter)
	if err != nil {
		return err
	}

	// check if any document was deleted
	if res.DeletedCount == 0 {
		return errors.New("No workspace found to delete for given userId and workspaceName")
	}

	return nil
}

// UpdateWorkspaceLayout updates the initialNodes and initialEdges for a workspace
func (r *workspaceRepository) UpdateWorkspaceLayout(ctx context.Context, workspaceId string, nodes, edges []map[string]interface{}) (bool, error) {
	oid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil {
		return false, err
	}

	// Create filter and update
	filter := bson.M{"_id": oid}
	update := bson.M{
		"$set": bson.M{
			"initialNodes": nodes,
			"initialEdges": edges,
			"updatedAt":    time.Now(),
		},
	}

	// Perform update
	result, err := r.workspaceCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return false, err
	}

	// Return true if document was modified
	return result.ModifiedCount > 0, nil
}

func NewWorkspaceRepository(workspaceCollection *mongo.Collection) WorkSpaceRepository {
	return &workspaceRepository{
		workspaceCollection: workspaceCollection,
	}
}
