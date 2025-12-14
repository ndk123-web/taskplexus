package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type FlowNode struct {
	ID       string                 `bson:"id" json:"id"`
	Type     string                 `bson:"type,omitempty" json:"type,omitempty"`
	Position map[string]interface{} `bson:"position" json:"position"`
	Data     map[string]interface{} `bson:"data,omitempty" json:"data,omitempty"`
}

type FlowEdge struct {
	ID       string                 `bson:"id" json:"id"`
	Source   string                 `bson:"source" json:"source"`
	Target   string                 `bson:"target" json:"target"`
	Animated bool                   `bson:"animated,omitempty" json:"animated,omitempty"`
	Style    map[string]interface{} `bson:"style,omitempty" json:"style,omitempty"`
	Type     string                 `bson:"type,omitempty" json:"type,omitempty"`
}

type Workspace struct {
	ID            primitive.ObjectID `bson:"_id,omitempty" json:"_id,omitempty"`
	UserId        primitive.ObjectID `bson:"userId,omitempty" json:"userId,omitempty"`
	WorkspaceName string             `bson:"workspaceName" json:"worskpaceName"`
	CreatedAt     time.Time          `bson:"createdAt" json:"createdAt"`
	UpdatedAt     time.Time          `bson:"updatedAt" json:"updatedAt"`
	Todos         []Todo             `bson:"todos,omitempty" json:"todos"`
	Goals         []Goals            `bson:"goals,omitempty" json:"goals"`
	InitialNodes  []FlowNode         `bson:"initialNodes,omitempty" json:"initialNodes,omitempty"`
	InitialEdges  []FlowEdge         `bson:"initialEdges,omitempty" json:"initialEdges,omitempty"`
}
