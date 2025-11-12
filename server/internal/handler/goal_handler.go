package handler

import (
	"context"
	"encoding/json"
	"github.com/ndk123-web/fast-todo/internal/service"
	"net/http"
)

type GoalHandler interface {
	GetUserGoals(w http.ResponseWriter, r *http.Request)
	CreateUserGoal(w http.ResponseWriter, r *http.Request)
}

type goalHandler struct {
	service service.GoalService
}

func (h *goalHandler) GetUserGoals(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("userId")
	workspaceId := r.PathValue("workspaceId")

	if userId == "" || workspaceId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "UserId / Workspace ID is empty in Handler"})
		return
	}

	goals, err := h.service.GetUserGoals(context.Background(), userId, workspaceId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": goals})
}

type createGoalReqBody struct {
	GoalName   string `json:"goalName"`
	TargetDays int64 `json:"targetDays"`
	Category   string `json:"category"`
}

func (h *goalHandler) CreateUserGoal(w http.ResponseWriter, r *http.Request) {
	var reqBody createGoalReqBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	userId := r.PathValue("userId")
	workspaceId := r.PathValue("workspaceId")

	goal, err := h.service.CreateUserGoal(context.Background(), userId, workspaceId, reqBody.GoalName, reqBody.TargetDays, reqBody.Category)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": goal})
}

func NewGoalHandler(service service.GoalService) GoalHandler {
	return &goalHandler{
		service: service,
	}
}
