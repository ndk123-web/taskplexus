package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/service"
)

type ChatHandler interface {
	HandleAiMessage(w http.ResponseWriter, r *http.Request)
	GetUserAiMessage(w http.ResponseWriter, r *http.Request)
}

type chatHandler struct {
	// Service dependencies would be injected here
	service service.ChatService
}

type handleAiMessage struct {
	WorkspaceId string `json:"workspaceId"`
	Prompt      string `json:"prompt"`
	UserId      string `json:"userId"`
}

func (h *chatHandler) HandleAiMessage(w http.ResponseWriter, r *http.Request) {
	var reqBody handleAiMessage
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": err.Error()})
		return
	}

	if reqBody.Prompt == "" || reqBody.WorkspaceId == "" {
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": "Prompt/WorkspaceId Should Not Be Empty"})
		return
	}

	response, err := h.service.HandleAiMessage(context.Background(), reqBody.Prompt, reqBody.WorkspaceId, reqBody.UserId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"success": "false", "Error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"success": "true", "response": response})
}

func (h *chatHandler) GetUserAiMessage(w http.ResponseWriter, r *http.Request) {

}

func NewChatHandler(service service.ChatService) ChatHandler {
	return &chatHandler{
		service: service,
	}
}
