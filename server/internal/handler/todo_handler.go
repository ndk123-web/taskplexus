// Package handler manages HTTP request handling for todo operations
package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"regexp"

	"github.com/ndk123-web/fast-todo/internal/middleware"
	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/service"
)

// TodoHandler defines the interface for HTTP request handlers for todo operations
type TodoHandler interface {
	GetTodos(w http.ResponseWriter, r *http.Request)
	CreateTodo(w http.ResponseWriter, r *http.Request)
	UpdateTodo(w http.ResponseWriter, r *http.Request)
	DeleteTodo(w http.ResponseWriter, r *http.Request)
	GetSpecificTodo(w http.ResponseWriter, r *http.Request)
}

// todoHandler implements TodoHandler with a service layer dependency
type todoHandler struct {
	service service.TodoService // Service layer for business logic
}

// NewTodoHandler creates a new instance of TodoHandler with the provided service
func NewTodoHandler(service service.TodoService) TodoHandler {
	return &todoHandler{
		service: service,
	}
}

// GetTodos handles HTTP GET requests to retrieve all todo items
// Returns a JSON array of todos or an error message
func (h *todoHandler) GetTodos(w http.ResponseWriter, r *http.Request) {
	todos, err := h.service.GetTodos(context.Background())
	if err != nil {
		http.Error(w, "Error fetching todos", http.StatusInternalServerError)
		return
	}

	userEmail, ok := r.Context().Value(middleware.UserEmailKey).(string)
	if !ok {
		http.Error(w, "UserEmail Not Exists in Email", http.StatusExpectationFailed)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"response": todos, "userEmail": userEmail})
}

// CreateTodo handles HTTP POST requests to create a new todo item
// Expects a JSON payload with todo details
// Returns the created todo or an error message
func (h *todoHandler) CreateTodo(w http.ResponseWriter, r *http.Request) {

	// Regex Based to get userId and workspaceID
	// var todoPath = regexp.MustCompile(`^/api/v1/users/([0-9a-zA-Z\-]+)/create-todo/([0-9a-zA-Z\-]+)$`)
	// matchers := todoPath.FindStringSubmatch(r.URL.Path)

	// userId := matchers[1]
	// workspaceId := matchers[2]

	userId := r.PathValue("userId")
	workspaceId := r.PathValue("workspaceId")

	// debug
	fmt.Println("User ID:", userId)
	fmt.Println("Workspace ID:", workspaceId)

	if userId == "" || workspaceId == "" {
		http.Error(w, "UserId / WorkspaceID is empty", http.StatusUnauthorized)
		return
	}

	var todo model.Todo
	err := json.NewDecoder(r.Body).Decode(&todo)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
	}

	fmt.Println("Body: ", r.Body)

	todores, todoerr := h.service.CreateTodo(context.Background(), todo, workspaceId, userId)

	if todoerr != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": todoerr.Error()})
	}

	fmt.Println("Todo Create : ", todores)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todores)
}

// updateTodo represents the request payload for updating a todo
type updateTodo struct {
	ID   string `json:"id"`   // ID of the todo to update
	Task string `json:"task"` // New task text
}

// UpdateTodo handles HTTP PUT requests to update an existing todo
// Expects a JSON payload with id and updated task
// Returns the updated todo or an error message
func (h *todoHandler) UpdateTodo(w http.ResponseWriter, r *http.Request) {
	var tobeUpdate updateTodo
	if err := json.NewDecoder(r.Body).Decode(&tobeUpdate); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
	}

	todo, err2 := h.service.UpdateTodo(context.Background(), tobeUpdate.ID, tobeUpdate.Task)
	if err2 != nil {
		json.NewEncoder(w).Encode(map[string]string{"error": err2.Error()})
	}

	json.NewEncoder(w).Encode(todo)
}

// deleteStruct represents the request payload for deleting a todo
type deleteStruct struct {
	ID string `json:"id"` // ID of the todo to delete
}

// DeleteTodo handles HTTP DELETE requests to remove a todo
// Expects a JSON payload with the todo ID
// Returns success status or an error message
func (h *todoHandler) DeleteTodo(w http.ResponseWriter, r *http.Request) {
	var todoStruct deleteStruct
	err := json.NewDecoder(r.Body).Decode(&todoStruct)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"error": err.Error()})
	}

	ok, err2 := h.service.DeleteTodo(context.Background(), todoStruct.ID)
	if err2 != nil {
		json.NewEncoder(w).Encode(map[string]string{"error": err2.Error()})
	}

	if !ok {
		json.NewEncoder(w).Encode(map[string]string{"error": "Delete False"})
	}

	json.NewEncoder(w).Encode(map[string]string{"Success": "True"})
}

func (h *todoHandler) GetSpecificTodo(w http.ResponseWriter, r *http.Request) {
	var todoPath = regexp.MustCompile(`^/api/v1/users/([0-9a-zA-Z\-]+)/get-specific-todo/([0-9a-zA-Z\-]+)$`)
	matchers := todoPath.FindStringSubmatch(r.URL.Path)

	if len(matchers) < 3 {
		http.Error(w, "Invalid URL", http.StatusBadRequest)
		return
	}

	userId := matchers[1]
	workspaceId := matchers[2]

	fmt.Println("User ID:", userId)
	fmt.Println("Workspace ID:", workspaceId)

	todo, err := h.service.GetSpecificTodo(context.Background(), workspaceId, userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": todo})
}
