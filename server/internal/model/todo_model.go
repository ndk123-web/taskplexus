package model

import "go.mongodb.org/mongo-driver/bson/primitive"

// ID has type of primitive.ObjectID
type Todo struct {
	ID   primitive.ObjectID `bson:"_id" json:"_id"`
	Task string             `bson:"task" json:"task"`
}
