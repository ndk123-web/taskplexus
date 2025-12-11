package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

// ID has type of primitive.ObjectID
type Todo struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Task string             `bson:"task,omitempty" json:"task,omitempty"`

	// This is Foreign Key / ref to User
	UserId      primitive.ObjectID `bson:"userId,omitempty" json:"userId,omitempty"`
	WorkspaceId primitive.ObjectID `bson:"workspaceId,omitempty" json:"workspaceId,omitempty"`

	Priority string `bson:"priority" json:"priority"`
	Description string `bson:"description,omitempty" json:"description,omitempty"`

	// why not omitempty
	// because if false then it wont show in json / bson response
	Done      bool      `bson:"done" json:"done"`
	CreatedAt time.Time `bson:"createdAt,omitempty" json:"createdAt,omitempty"`
	UpdatedAt time.Time `bson:"updatedAt,omitempty" json:"updatedAt,omitempty"`

	Deadline      *time.Time `bson:"deadline,omitempty" json:"deadline,omitempty"`
	EstimatedTime *int       `bson:"estimatedTime,omitempty" json:"estimatedTime,omitempty"`
}
