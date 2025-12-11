package model

type CreateOrderRequest struct {
	Amount   string `json:"amount"`
	Currency string `json:"currency"`
	UserId   string `json:"userId"`
}

type CreateOrderResponse struct {
	OrderId string `json:"order_id"`
	Success bool   `json:"success"`
	Error   string `json:"error,omitempty"`
}

type VerifyPaymentRequest struct {
	PaymentId string `json:"razorpay_payment_id"`
	OrderId   string `json:"razorpay_order_id"`
	Signature string `json:"razorpay_signature"`
}

type CancelOrderReqBody struct {
	OrderId string `json:"orderId"`
}

type CancelPaymentReqBody struct {
	PaymentId string `json:"paymentId"`
}
