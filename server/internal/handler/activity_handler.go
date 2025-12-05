package handler

import (
	// "context"
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/service"
)

type ActivityHandler interface {
	HandleActivityEvent(w http.ResponseWriter, r http.Request)
}

type activityHandler struct {
	service *service.ActivityService
}

func (h *activityHandler) HandleActivityEvent(w http.ResponseWriter, r http.Request) {
	// return
}

func NewActivityHandler(service *service.ActivityService) ActivityHandler {
	return &activityHandler{
		service: service,
	}
}
