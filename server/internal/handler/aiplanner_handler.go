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
	GetAiPlannerById(w http.ResponseWriter, r *http.Request)
	GetAllAiPlanners(w http.ResponseWriter, r *http.Request)
}

type aiPlannerHandler struct {
	service service.AiPlannerService
}

func (h *aiPlannerHandler) HandleAiPlanner(w http.ResponseWriter, r *http.Request) {
	// need to write

	w.Header().Set("Content-Type", "application/json")
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

func (h *aiPlannerHandler) GetAiPlannerById(w http.ResponseWriter, r *http.Request) {
	aiPlannerId := r.PathValue("aiPlannerId")

	if aiPlannerId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "AiPlanner ID Can't Be Empty", "success": "false"})
		return
	}

	response, err := h.service.GetAiPlannerById(context.Background(), aiPlannerId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": response, "success": "true"})
}

func (h *aiPlannerHandler) GetAllAiPlanners(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("userId")
	workspaceHandlerId := r.PathValue("workspaceId")

	page := r.URL.Query().Get("page")
	limit := r.URL.Query().Get("limit")

	if page == "" {
		page = "1"
	}
	if limit == "" {
		limit = "7"
	}

	reqBody := model.GetAllAiPlannersReq{
		UserId:      userId,
		WorkspaceId: workspaceHandlerId,
	}

	if reqBody.UserId == "" || reqBody.WorkspaceId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "UserId/WorkspaceId Can't Be Empty", "success": "false"})
		return
	}

	response, err, count := h.service.GetAllAiPlanners(context.Background(), reqBody.UserId, reqBody.WorkspaceId, page, limit)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": response, "success": "true", "count": count})
}

func NewAiPlannerHandler(service service.AiPlannerService) AiPlannerHandler {
	return &aiPlannerHandler{
		service: service,
	}
}
