package handler

import (
	// "context"
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/service"
)

type ActivityHandler interface {
	HandleActivityEvent(w http.ResponseWriter, r *http.Request)
	GetActivities(w http.ResponseWriter, r *http.Request)
}

type activityHandler struct {
	service service.ActivityService
}

func (h *activityHandler) HandleActivityEvent(w http.ResponseWriter, r *http.Request) {
	var reqBody model.HandleActivityBody

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": err.Error()})
		return
	}

	response, err := h.service.HandleActivityEvent(context.Background(), reqBody)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": "true", "response": response})
}

func (h *activityHandler) GetActivities(w http.ResponseWriter, r *http.Request) {
	q := r.URL.Query()

	// Read query params
	pageStr := q.Get("page")
	limitStr := q.Get("limit")
	filter := q.Get("filter")
	workspaceId := q.Get("workspaceId")

	if pageStr == "" || workspaceId == "" || limitStr == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": "Url Query is Not Valid"})
		return
	}

	if filter == "" {
		filter = "both"
	}

	pageInt64, err := strconv.ParseInt(pageStr, 10, 64)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": "Page Query is Not Valid"})
		return
	}
	if pageInt64 < 1 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": "Page Can Not Be Less Than 1"})
		return
	}

	limitInt64, err := strconv.ParseInt(limitStr, 10, 64)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": "Limit Query is Not Valid"})
		return
	}
	if limitInt64 < 5 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": "Limit Can Not Be Less Than 5"})
		return
	}

	data := model.GetActivityData{
		Page:        pageInt64,
		Limit:       limitInt64,
		Filter:      filter,
		WorkspaceId: workspaceId,
	}

	activities, err := h.service.GetActivities(context.Background(), data)
	if err != nil {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"response": activities, "success": "true"})
}

func NewActivityHandler(service service.ActivityService) ActivityHandler {
	return &activityHandler{
		service: service,
	}
}
