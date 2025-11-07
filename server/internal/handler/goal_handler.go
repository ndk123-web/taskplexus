package handler

import (
	"context"
	"encoding/json"
	"github.com/ndk123-web/fast-todo/internal/service"
	"net/http"
)

type GoalHandler interface {
	GetUserGoals(w http.ResponseWriter, r *http.Request)
}

type goalHandler struct {
	service service.GoalService
}

func (h *goalHandler) GetUserGoals(w http.ResponseWriter, r *http.Request) {
	values := r.URL.Query()

	// set the userID when login / signup
	userId := values.Get("userId")

	if userId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "UserId is Empty"})
		return
	}

	goals, err := h.service.GetUserGoals(context.Background(), userId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}
	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]any{"response": goals})
}

func NewGoalHandler(service service.GoalService) GoalHandler {
	return &goalHandler{
		service: service,
	}
}
