package model

type CreateOrderRequest struct {
	Amount   string `json:"amount"`
	Currency string `json:"currency"`
}

type CreateOrderResponse struct {
	OrderId string `json:"order_id"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}
