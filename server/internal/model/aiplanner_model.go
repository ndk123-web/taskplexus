package model

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AiPlanner struct {
	ID          primitive.ObjectID `json:"id" bson:"_id,omitempty"`
	UserID      primitive.ObjectID `json:"userId" bson:"userId"`
	WorkspaceId primitive.ObjectID `json:"workspace" bson:"workspace"`
	Date        string             `json:"date" bson:"date"` // e.g. "2025-12-07"
	Plan        []AiPlanItem       `json:"plan" bson:"plan"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
	Context     string             `json:"context" bson:"context"`
	Summary     string             `json:"summary" bson:"summary"`
}

type AiPlanItem struct {
	TaskID    string `json:"taskId" bson:"taskId"`
	Title     string `json:"title" bson:"title"`
	StartTime string `json:"startTime" bson:"startTime"` // "09:00"
	EndTime   string `json:"endTime" bson:"endTime"`     // "09:45"
	Priority  string `json:"priority" bson:"priority"`
}

type AiPlannerReqBody struct {
	UserId      string `json:"userId"`
	WorkspaceId string `json:"workspaceId"`
	Context     string `json:"context"`
}

type AiPlannerLLMResponse struct {
	Date    string       `json:"date"`
	Plan    []AiPlanItem `json:"plan"`
	Summary string       `json:"summary"`
}

type GetAiPlannerByIdReq struct {
	AiPlannerId string `json:"aiPlannerId"`
}

type GetAllAiPlannersReq struct {
	UserId      string `json:"userId"`
	WorkspaceId string `json:"workspaceId"`
}
