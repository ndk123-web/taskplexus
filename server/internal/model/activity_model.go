package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type ActivityType string

const (
	ActivityTaskCompleted ActivityType = "TASK_COMPLETED"
	ActivityTaskCreated   ActivityType = "TASK_CREATED"
	ActivityGoalCompleted ActivityType = "GOAL_COMPLETED"
	ActivityGoalCreated   ActivityType = "GOAL_CREATED"
)

type ModelMetaDataStructure struct {
	Id          primitive.ObjectID `json:"id" bson:"id"`
	WorkspaceId primitive.ObjectID `json:"workspaceId" bson:"workspaceId"`
	Name        string             `json:"name" bson:"name"`
}

type Activity struct {
	ID        primitive.ObjectID     `json:"_id" bson:"_id"`
	Type      ActivityType           `json:"activityType" bson:"activityType"`
	Metadata  ModelMetaDataStructure `json:"metadata" bson:"metadata"`
	TimeStamp time.Time              `json:"timeStamp" bson:"timeStamp"`
}

type MetadataStructure struct {
	Id          string `json:"id"`
	WorkspaceId string `json:"workspaceId"`
	Name        string `json:"name"`
}
type HandleActivityBody struct {
	Type     ActivityType      `json:"type"`
	Metadata MetadataStructure `json:"metadata"`
}
