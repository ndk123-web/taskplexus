package model

import "go.mongodb.org/mongo-driver/bson/primitive"

type Chat struct {
	Id          primitive.ObjectID `json:"_id" bson:"_id"`
	UserId      primitive.ObjectID `json:"userId" bson:"userId"`
	WorkspaceId primitive.ObjectID `json:"workspaceId" bson:"workspaceId"`
	Prompt      string             `json:"prompt" bson:"prompt"`
	Response    string             `json:"response" bson:"response"`
}
