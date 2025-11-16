package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/ndk123-web/fast-todo/internal/middleware"
	"github.com/ndk123-web/fast-todo/internal/repository"
	"github.com/ndk123-web/fast-todo/internal/service"
	"net/http"
)

type WorkspaceHandler interface {
	GetAllUserWorkspace(w http.ResponseWriter, r *http.Request)
	CreateWorkspace(w http.ResponseWriter, r *http.Request)
	UpdateWorkspace(w http.ResponseWriter, r *http.Request)
	DeleteWorkspace(w http.ResponseWriter, r *http.Request)
}

type workspaceHandler struct {
	service service.WorkspaceService
}

func (h *workspaceHandler) GetAllUserWorkspace(w http.ResponseWriter, r *http.Request) {

	// get the userId fromt the Query ?userId=ado13
	values := r.URL.Query()
	var userId string = values.Get("userId")

	workspaces, err := h.service.GetAllUserWorkspace(context.Background(), userId)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "Success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": workspaces, "Success": "true"})
}

type createWorkspaceStruct struct {
	WokspaceName string `json:"workspaceName"`
	UserId       string `json:"userId"`
}

func (h *workspaceHandler) CreateWorkspace(w http.ResponseWriter, r *http.Request) {
	var requestBody createWorkspaceStruct
	if err := json.NewDecoder(r.Body).Decode(&requestBody); err != nil {
		json.NewEncoder(w).Encode(map[string]any{"response": map[string]any{"success": "false", "Error": err.Error()}})
		return
	}

	if requestBody.WokspaceName == "" || requestBody.UserId == "" {
		http.Error(w, "Empty Workspace Name / UserId", 401)
		return
	}

	// get the context
	ctx := r.Context()

	// get the value from ctx
	userEmail, ok := ctx.Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "Unauthorized Email Not Found", 401)
		return
	}

	// debug
	fmt.Println("User Email in Create Workspace: ", userEmail)

	workspaceId, err := h.service.CreateWorkspace(context.Background(), requestBody.UserId, requestBody.WokspaceName)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]any{"response": map[string]any{"success": "false", "Error": err.Error()}})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": map[string]any{"workspaceId": workspaceId, "success": "true"}})
}

type updateReqBody struct {
	UserId               string `json:"userId"`
	WorkspaceName        string `json:"workspaceName"`
	UpdatedWorkspaceName string `json:"updatedWorkspaceName"`
}

func (h *workspaceHandler) UpdateWorkspace(w http.ResponseWriter, r *http.Request) {
	var updateBody updateReqBody
	err := json.NewDecoder(r.Body).Decode(&updateBody)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	if updateBody.UserId == "" || updateBody.WorkspaceName == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "UserId / Workspace Name is Empty"})
		return
	}

	err = h.service.UpdatedWorkspace(context.Background(), updateBody.UserId, updateBody.WorkspaceName, updateBody.UpdatedWorkspaceName)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"response": "Success"})
}

type deleteReqBody struct {
	UserId        string `json:"userId"`
	WorkspaceName string `json:"workspaceName"`
}

func (h *workspaceHandler) DeleteWorkspace(w http.ResponseWriter, r *http.Request) {

	// parse the body
	var deleteBody deleteReqBody

	// decode the body to struct deleteReqBody of var deleteBody
	if err := json.NewDecoder(r.Body).Decode(&deleteBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	// validate
	if deleteBody.UserId == "" || deleteBody.WorkspaceName == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "UserId / Workspace Name is Empty"})
		return
	}

	// call the service delete method
	err := h.service.DeleteWorkspace(context.Background(), deleteBody.UserId, deleteBody.WorkspaceName)
	if err != nil {
		// error response
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	// success response
	json.NewEncoder(w).Encode(map[string]string{"response": "Success"})
}

// New Workspace Handler
func NewWorkspaceHandler(service repository.WorkSpaceRepository) WorkspaceHandler {
	return &workspaceHandler{
		service: service,
	}
}
