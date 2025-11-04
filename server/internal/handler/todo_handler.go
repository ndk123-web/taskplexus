package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/service"
	"net/http"
)

type TodoHandler interface {
	GetTodos(w http.ResponseWriter, r *http.Request)
	CreateTodo(w http.ResponseWriter, r *http.Request)
}

type todoHandler struct {
	service service.TodoService
}

func NewTodoHandler(service service.TodoService) TodoHandler {
	return &todoHandler{
		service: service,
	}
}

func (h *todoHandler) GetTodos(w http.ResponseWriter, r *http.Request) {
	todos, err := h.service.GetTodos(context.Background())
	if err != nil {
		http.Error(w, "Error fetching todos", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todos)
}

func (h *todoHandler) CreateTodo(w http.ResponseWriter, r *http.Request) {
	var todo model.Todo

	err := json.NewDecoder(r.Body).Decode(&todo)

	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
	}

	fmt.Println("Body: ", todo)

	todores, todoerr := h.service.CreateTodo(context.Background(), todo)

	if todoerr != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": todoerr.Error()})
	}

	fmt.Println("Todo Create : ", todores)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(todores)
}
