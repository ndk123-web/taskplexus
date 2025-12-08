package model

type CreateOrderRequest struct {
	Amount   float64 `json:"amount"`
	Currency string  `json:"currency"`
}
