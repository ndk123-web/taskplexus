package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"
	// "github.com/redis/go-redis/v9"

	// "github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/config"
	cfg "github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/model"

	// "github.com/ndk123-web/fast-todo/internal/repository"
	"github.com/ndk123-web/fast-todo/internal/service"
)

type UserHandler interface {
	GetUserTodos(w http.ResponseWriter, r *http.Request)
	SignUpUser(w http.ResponseWriter, r *http.Request)
	RefreshToken(w http.ResponseWriter, r *http.Request)
	SignInUser(w http.ResponseWriter, r *http.Request)
	UpdateUserName(w http.ResponseWriter, r *http.Request)
	CheckUserPremium(w http.ResponseWriter, r *http.Request)
	ForgetPasswordSetToken(w http.ResponseWriter, r *http.Request)
	ResetPassword(w http.ResponseWriter, r *http.Request)
	CheckPaymentStatus(w http.ResponseWriter, r *http.Request)
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

type signUpBody struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	FullName    string `json:"fullName"`
	GoogleLogin bool   `json:"googleLogin"`
	IdToken     string `json:"idToken"`
}

// sign up user handler
func (h *userHandler) SignUpUser(w http.ResponseWriter, r *http.Request) {
	var bodyResponse signUpBody
	if err := json.NewDecoder(r.Body).Decode(&bodyResponse); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	fmt.Println("Google Login: ", bodyResponse.GoogleLogin)

	if bodyResponse.GoogleLogin {
		if bodyResponse.IdToken == "" { // idToken required for google flow
			json.NewEncoder(w).Encode(map[string]string{"Error": "Missing Google ID token"})
			return
		}
		token, err := cfg.FirebaseAuth.VerifyIDToken(context.Background(), bodyResponse.IdToken)
		if err != nil {
			json.NewEncoder(w).Encode(map[string]string{"Error": "Invalid Google Token"})
			return
		}

		emailClaim, ok := token.Claims["email"].(string)
		if !ok || emailClaim == "" {
			json.NewEncoder(w).Encode(map[string]string{"Error": "Email Missing in Google Token"})
			return
		}

		nameClaim, ok := token.Claims["name"].(string)
		if !ok || nameClaim == "" {
			json.NewEncoder(w).Encode(map[string]string{"Error": "Name Missing in Google Token"})
			return
		}

		result, err := h.service.SignUpWithGoogle(context.Background(), emailClaim, nameClaim)
		if err != nil {
			json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
			return
		}

		// it means all good now send the email
		go func() {
			if err := config.SendEmailViaBrevo(bodyResponse.Email, "", "", "Welcome"); err != nil {
				log.Printf("Can not able to send email to %v because error %v", bodyResponse.Email, err.Error())
			}
		}()

		json.NewEncoder(w).Encode(map[string]any{"response": result, "success": "true"})
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

	// it means all good now send the email
	go func() {
		if err := config.SendEmailViaBrevo(bodyResponse.Email, "", "", "Welcome"); err != nil {
			log.Printf("Can not able to send email to %v because error %v", bodyResponse.Email, err.Error())
		}
	}()

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"response": result})
}

// refresh token user handler
func (h *userHandler) RefreshToken(w http.ResponseWriter, r *http.Request) {
	refreshToken := r.Header.Get("Authorization")

	if refreshToken == "" {
		http.Error(w, "No refresh token", http.StatusUnauthorized)
		return
	}

	// Remove Bearer prefix if present
	refreshToken = strings.TrimPrefix(refreshToken, "Bearer ")
	refreshToken = strings.TrimSpace(refreshToken)

	claims := jwt.MapClaims{}
	_, err := jwt.ParseWithClaims(refreshToken, claims, func(t *jwt.Token) (interface{}, error) {
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

	// create refresh token too if needed
	newRefresh := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email": claims["email"],
		"exp":   time.Now().Add(7 * 24 * time.Hour).Unix(),
	})
	refreshStr, _ := newRefresh.SignedString([]byte(service.JWTSECRET))

	json.NewEncoder(w).Encode(map[string]string{"_accessToken": tokenStr, "_refreshToken": refreshStr, "success": "true"})
}

type userSignInBody struct {
	Email       string `json:"email"`
	Password    string `json:"password"`
	GoogleLogin bool   `json:"googleLogin"`
	IdToken     string `json:"idToken"`
}

// sign in user handler
func (h *userHandler) SignInUser(w http.ResponseWriter, r *http.Request) {
	var body userSignInBody
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}
	fmt.Println("user Sign in body: ", body)

	// Branch: Google login
	if body.GoogleLogin {
		if body.IdToken == "" { // idToken required for google flow
			json.NewEncoder(w).Encode(map[string]string{"Error": "Missing Google ID token", "success": "false"})
			return
		}
		// Verify ID token with Firebase
		token, err := cfg.FirebaseAuth.VerifyIDToken(context.Background(), body.IdToken)
		if err != nil {
			json.NewEncoder(w).Encode(map[string]string{"Error": "Invalid Google token", "success": "false"})
			return
		}
		emailClaim, ok := token.Claims["email"].(string)
		if !ok || emailClaim == "" {
			json.NewEncoder(w).Encode(map[string]string{"Error": "Email missing in Google token", "success": "false"})
			return
		}
		nameClaim, _ := token.Claims["name"].(string)
		resp, err := h.service.SignInGoogleUser(context.Background(), emailClaim, nameClaim)
		if err != nil {
			json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
			return
		}

		// it means all good now send the email
		go func(userAgent string, remoteAddr string) {

			if err := config.SendEmailViaBrevo(body.Email, "", "", "SignIn", userAgent, remoteAddr); err != nil {
				log.Printf("Can not able to send email to %v because error %v", body.Email, err.Error())
			}

		}(r.UserAgent(), r.RemoteAddr)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]any{"response": resp, "success": "true"})
		return
	}

	// Normal login path
	if body.Email == "" || body.Password == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Email/Password Empty", "success": "false"})
		return
	}
	resp, err := h.service.SignInUser(context.Background(), body.Email, body.Password)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	// it means all good now send the email
	go func(userAgent string, remoteAddr string) {

		if err := config.SendEmailViaBrevo(body.Email, "", "", "SignIn", userAgent, remoteAddr); err != nil {
			log.Printf("Can not able to send email to %v because error %v", body.Email, err.Error())
		}

	}(r.UserAgent(), r.RemoteAddr)
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]any{"response": resp, "success": "true"})
}

type updateUserNameBody struct {
	NewName string `json:"newName"`
}

func (h *userHandler) UpdateUserName(w http.ResponseWriter, r *http.Request) {
	var reqBody updateUserNameBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	userId := r.PathValue("userId")
	if userId == "" || reqBody.NewName == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "User Id is Empty In Handler", "success": "false"})
		return
	}

	isUpdated, err := h.service.UpdateUserName(context.Background(), userId, reqBody.NewName)
	if err != nil || !isUpdated {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"response": "Success Update User Name", "success": "true"})
}

func (h *userHandler) CheckUserPremium(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("userId")
	if userId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "User Id is Empty In Handler", "success": "false"})
		return
	}

	// Best Practice: Use a specific namespace for the key
	cacheKey := "user:plan:" + userId
	rdb := config.RedisClient

	// 1. Try to get from Cache
	val, err := rdb.Get(context.Background(), cacheKey).Result()
	if err == nil {
		var data model.CheckUserPremiumResponse
		if errUnmarshal := json.Unmarshal([]byte(val), &data); errUnmarshal == nil {
			fmt.Println("Cache Hit For Check Plan Status")
			json.NewEncoder(w).Encode(map[string]any{"response": data, "success": "true"})
			return
		}
	}

	// 2. If Cache Miss, fetch from Service (DB)
	response, err := h.service.CheckUserPremium(context.Background(), userId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	// 3. Set Cache (Best Effort)
	// We can cache for a longer time (e.g., 24h) because we will invalidate (delete) this key
	// whenever the user's plan changes (in CreatePayment/Webhook).
	if jsonBytes, errMarshal := json.Marshal(response); errMarshal == nil {
		rdb.Set(context.Background(), cacheKey, jsonBytes, 24*time.Hour)
	}

	json.NewEncoder(w).Encode(map[string]any{"response": response, "success": "true"})
}

func (h *userHandler) ForgetPasswordSetToken(w http.ResponseWriter, r *http.Request) {
	var reqBody model.ForgetPasswordRequestBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	if reqBody.Email == "" || reqBody.UserId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Email/UserId Empty", "success": "false"})
		return
	}

	// call service to set the token and send email
	err := h.service.ForgetPasswordSetToken(context.Background(), reqBody.Email, reqBody.UserId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"response": "Success Send Forget Password Email", "success": "true"})
}

func (h *userHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	var reqBody model.ResetPasswordRequestBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	if reqBody.Email == "" || reqBody.Token == "" || reqBody.NewPassword == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Email/Token/NewPassword Empty", "success": "false"})
		return
	}

	// call service to reset the password
	if err := h.service.ResetPassword(context.Background(), reqBody.Email, reqBody.Token, reqBody.NewPassword); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"response": "Success Reset Password", "success": "true"})
}

func (h *userHandler) CheckPaymentStatus(w http.ResponseWriter, r *http.Request) {
	paymentId := r.PathValue("paymentId")
	if paymentId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Payment Id is Empty In Handler", "success": "false"})
		return
	}

	response, err := h.service.CheckPaymentStatus(context.Background(), paymentId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": response, "success": "true"})
}

func NewUserHandler(service service.UserService) UserHandler {
	return &userHandler{
		service: service,
	}
}
