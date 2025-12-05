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

type Activity struct {
	ID           primitive.ObjectID `json:"_id" bson:"_id"`
	Type ActivityType       `json:"activityType" bson:"activityType"`
	Metadata     any                `json:"metadata" bson:"metadata"`
	TimeStamp    time.Time          `json:"timeStamp" bson:"timeStamp"`
}
