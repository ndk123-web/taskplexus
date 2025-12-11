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
	HandlerCancelOrder(w http.ResponseWriter, r *http.Request)
	HandlerCancelPayment(w http.ResponseWriter, r *http.Request)
	HandleRazorPayWebhook(w http.ResponseWriter, r *http.Request)
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

	orderId, err := p.service.CreateOrder(context.Background(), reqBody.Amount, reqBody.Currency, reqBody.UserId)
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

func (p *payementHandler) HandlerCancelOrder(w http.ResponseWriter, r *http.Request) {
	var reqBody model.CancelOrderReqBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Invalid request body", "success": "false"})
		return
	}

	// cancellation logic to be added in future
	err := p.service.CancelOrder(context.Background(), reqBody.OrderId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Order cancelled successfully", "success": "true"})
}

func (p *payementHandler) HandlerCancelPayment(w http.ResponseWriter, r *http.Request) {
	var reqBody model.CancelPaymentReqBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Invalid request body", "success": "false"})
		return
	}

	// cancellation logic to be added in future
	err := p.service.CancelPayment(context.Background(), reqBody.PaymentId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"message": "Payment cancelled successfully", "success": "true"})
}

func (p *payementHandler) HandleRazorPayWebhook(w http.ResponseWriter, r *http.Request) {
	var payload model.RazorPayWebhookPayload
	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	err := p.service.HandleRazorPayWebhook(context.Background(), payload)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	// Acknowledging the webhook
	w.WriteHeader(http.StatusOK)
}

func NewPayementHandler(s service.PaymentService) PayementHandler {
	return &payementHandler{
		service: s,
	}
}
