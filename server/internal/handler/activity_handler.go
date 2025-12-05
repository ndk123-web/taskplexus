package handler

import (
	// "context"
	"context"
	"encoding/json"
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/service"
)

type ActivityHandler interface {
	HandleActivityEvent(w http.ResponseWriter, r http.Request)
}

type activityHandler struct {
	service service.ActivityService
}

type MetadataStructure struct {
	Id          string `json:"id"`
	WorkspaceId string `json:"workspaceId"`
	Name        string `json:"name"`
}
type HandleActivityBody struct {
	Type     model.ActivityType `json:"type"`
	Metadata MetadataStructure  `json:"metadata"`
}

func (h *activityHandler) HandleActivityEvent(w http.ResponseWriter, r http.Request) {
	var reqBody HandleActivityBody

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

func NewActivityHandler(service service.ActivityService) ActivityHandler {
	return &activityHandler{
		service: service,
	}
}
