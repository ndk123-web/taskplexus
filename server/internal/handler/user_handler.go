package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/service"
)

type UserHandler interface {
	GetUserTodos(w http.ResponseWriter, r *http.Request)
}

type userHandler struct {
	service service.UserService
}

type getUserTodoStruct struct {
	UserId string `json:"userId"`
}

func (h *userHandler) GetUserTodos(w http.ResponseWriter, r *http.Request) {
	var userStruct getUserTodoStruct

	err := json.NewDecoder(r.Body).Decode(&userStruct)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
	}

	w.Header().Set("Content-Type", "application/json")

	userTodos, err2 := h.service.GetUserTodos(context.Background(), userStruct.UserId)
	if err2 != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err2.Error()})
	}

	json.NewEncoder(w).Encode(userTodos)
}

func NewUserHandler(service service.UserService) UserHandler {
	return &userHandler{
		service: service,
	}
}
