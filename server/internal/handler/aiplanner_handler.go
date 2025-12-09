package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/service"
)

type AiPlannerHandler interface {
	HandleAiPlanner(w http.ResponseWriter, r *http.Request)
}

type aiPlannerHandler struct {
	service service.AiPlannerService
}

func (h *aiPlannerHandler) HandleAiPlanner(w http.ResponseWriter, r *http.Request) {
	// need to write

	var reqBody model.AiPlannerReqBody

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	if reqBody.UserId == "" || reqBody.WorkspaceId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "UserId/WorkspaceId Can't Be Empty", "success": "false"})
		return
	}

	result, err := h.service.HandleAiPlanner(context.Background(), reqBody)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": result, "success": "true"})
}

func NewAiPlannerHandler(service service.AiPlannerService) AiPlannerHandler {
	return &aiPlannerHandler{
		service: service,
	}
}
