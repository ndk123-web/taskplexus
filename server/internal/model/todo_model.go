package model

import "go.mongodb.org/mongo-driver/bson/primitive"

// ID has type of primitive.ObjectID
type Todo struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Task string             `bson:"task,omitempty" json:"task,omitempty"`

	// This is Foreign Key / ref to User
	UserId primitive.ObjectID `bson:"userId,omitempty" json:"userId,omitempty"`

	Priority string `bson:"priority" json:"priority"`

	// why not omitempty
	// because if false then it wont show in json / bson response
	Done        bool               `bson:"done" json:"done"`
	WorkspaceId primitive.ObjectID `bson:"worspaceId" json:"worspaceId"`
}
