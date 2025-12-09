package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Goals struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id"`
	Title         string             `bson:"title" json:"title"`
	UserId        primitive.ObjectID `bson:"userId" json:"userId"`
	TargetDays    int                `bson:"targetDays" json:"targetDays"`
	Category      string             `bson:"category" json:"category"`
	Done          bool               `bson:"done" json:"done"`
	CurrentTarget int64              `bson:"currentTarget" json:"currentTarget"`
	WorkspaceId   primitive.ObjectID `bson:"workspaceId" json:"workspaceId"`
	CreatedAt     time.Time          `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt     time.Time          `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`
}
