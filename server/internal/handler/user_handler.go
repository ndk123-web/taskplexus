package handler

import (
	"context"
	"encoding/json"
	"github.com/golang-jwt/jwt"
	"github.com/ndk123-web/fast-todo/internal/repository"
	"github.com/ndk123-web/fast-todo/internal/service"
	"net/http"
	"time"
)

type UserHandler interface {
	GetUserTodos(w http.ResponseWriter, r *http.Request)
	SignUpUser(w http.ResponseWriter, r *http.Request)
	RefreshToken(w http.ResponseWriter, r *http.Request)
	SignInUser(w http.ResponseWriter, r *http.Request)
}

type userHandler struct {
	service service.UserService
}

type getUserTodoStruct struct {
	UserId string `json:"userId"`
}

// Get User Todos Handler
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

// sign up user handler
func (h *userHandler) SignUpUser(w http.ResponseWriter, r *http.Request) {
	var bodyResponse repository.UserStruct
	if err := json.NewDecoder(r.Body).Decode(&bodyResponse); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	if bodyResponse.Email == "" || bodyResponse.Password == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Email/Password Empty"})
		return
	}

	result, err2 := h.service.SignUpUser(context.Background(), bodyResponse.Email, bodyResponse.Password, bodyResponse.FullName)
	if err2 != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err2.Error()})
		return
	}

	// why .(string) because compiler doesn't know that inside UserEmailKey is string so that we are
	// telling the compilet that inside .UserEmailKey is data which is of type string

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"response": result})
}

// refresh token user handler
func (h *userHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	refreshToken, err := r.Cookie("_refresh_token")
	if err != nil {
		http.Error(w, "No refresh token", http.StatusUnauthorized)
		return
	}

	claims := jwt.MapClaims{}
	_, err = jwt.ParseWithClaims(refreshToken.Value, claims, func(t *jwt.Token) (interface{}, error) {
		return []byte(service.JWTSECRET), nil
	})

	if err != nil {
		http.Error(w, "Invalid refresh token", http.StatusUnauthorized)
		return
	}

	// create new access token
	newAccess := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": claims["email"],
		"exp":   time.Now().Add(15 * time.Minute).Unix(),
	})

	// w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
	w.Header().Set("Content-Type", "application/json")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	tokenStr, _ := newAccess.SignedString([]byte(service.JWTSECRET))
	json.NewEncoder(w).Encode(map[string]string{"accessToken": tokenStr})
}

// sign in user handler
func (h *userHandler) SignInUser(w http.ResponseWriter, r *http.Request) {
	var userDetails repository.UserStruct
	if err := json.NewDecoder(r.Body).Decode(&userDetails); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	if userDetails.Email == "" || userDetails.Password == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Email/Password Empty"})
		return
	}

	response, err := h.service.SignInUser(context.Background(), userDetails.Email, userDetails.Password)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"response": response})
}

func NewUserHandler(service service.UserService) UserHandler {
	return &userHandler{
		service: service,
	}
}
