package model

import "go.mongodb.org/mongo-driver/bson/primitive"

// ID has type of primitive.ObjectID
type Todo struct {
	ID   primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	Task string             `bson:"task,omitempty" json:"task,omitempty"`
	Done bool               `bson:"done,omitempty" json:"done,omitempty"`
}
