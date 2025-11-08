package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/service"
)

type WorkspaceHandler interface {
	GetAllUserWorkspace(w http.ResponseWriter, r *http.Request)
}

type workspaceHandler struct {
	service service.WorkspaceService
}

func (h *workspaceHandler) GetAllUserWorkspace(w http.ResponseWriter, r *http.Request) {

	// get the userId fromt the Query ?userId=ado13
	values := r.URL.Query()
	var userId string = values.Get("userId")

	workspaces, err := h.service.GetAllUserWorkspaces(context.Background(), userId)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": workspaces})
}
