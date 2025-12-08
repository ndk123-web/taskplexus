package handler

import (
	"context"
	"encoding/json"
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/service"
)

type PayementHandler interface {
	HandleCreateOrder(w http.ResponseWriter, r *http.Request)
}

type payementHandler struct {
	service service.PaymentService
}

func (p *payementHandler) HandleCreateOrder(w http.ResponseWriter, r *http.Request) {
	var reqBody model.CreateOrderRequest
	w.Header().Set("Content-Type", "application/json")

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Invalid request body", "success": "false"})
		return
	}

	if reqBody.Amount <= 0 || reqBody.Currency == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Amount and Currency are required", "success": "false"})
		return
	}

	orderId, err := p.service.CreateOrder(context.Background(), reqBody.Amount, reqBody.Currency)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"order_id": orderId, "success": "true"})
}

func NewPayementHandler(s service.PaymentService) PayementHandler {
	return &payementHandler{
		service: s,
	}
}
