package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Goals struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Title         string             `bson:"title" json:"title"`
	UserId        primitive.ObjectID `bson:"userId" json:"userId"`
	TargetDays    int                `bson:"targetDays" json:"targetDays"`
	Category      string             `bson:"category" json:"category"`
	Done          bool               `bson:"done" json:"done"`
	CurrentTarget int                `bson:"currentTarget" json:"currentTarget"`
	WorkspaceId   primitive.ObjectID `bson:"workspaceId" json:"workspaceId"`
}
