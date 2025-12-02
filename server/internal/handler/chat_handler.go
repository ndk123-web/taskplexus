package handler

import "net/http"

type ChatHandler interface {
	HandleAiMessage(w http.ResponseWriter, r *http.Request)
	GetUserAiMessage(w http.ResponseWriter, r *http.Request)
}

type chatHandler struct {
	// Service dependencies would be injected here
}