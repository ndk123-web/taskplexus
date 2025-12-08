package handler

import (
	"context"
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/service"
)

type PayementHandler interface {
	HandleCreateOrder(w http.ResponseWriter, r *http.Request)
	HandleVerifyPayement(w http.ResponseWriter, r *http.Request)
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

	amount, err := strconv.ParseFloat(reqBody.Amount, 64)
	if err != nil || amount <= 0 {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Invalid amount", "success": "false"})
		return
	}
	if reqBody.Currency == "" {
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

func (p *payementHandler) HandleVerifyPayement(w http.ResponseWriter, r *http.Request) {
	var reqBody model.VerifyPaymentRequest
	w.Header().Set("Content-Type", "application/json")

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Invalid request body", "success": "false"})
		return
	}

	// verification logic to be added
	isVerify, err := p.service.VerifyPayement(context.Background(), reqBody)
	if err != nil || !isVerify {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Payment verified successfully", "success": "true"})
}

func NewPayementHandler(s service.PaymentService) PayementHandler {
	return &payementHandler{
		service: s,
	}
}
