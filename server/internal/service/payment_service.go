package service

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"

	"github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
	// "github.com/razorpay/razorpay-go"
)

type PaymentService interface {
	CreateOrder(ctx context.Context, amount string, currency string) (string, error)
	VerifyPayement(ctx context.Context, data model.VerifyPaymentRequest) (bool, error)
}

type payementService struct {
	repo repository.PayementRepository
}

func (p *payementService) CreateOrder(ctx context.Context, amount string, currency string) (string, error) {
	// create order and return something

	order, err := config.RazorPay.Client.Order.Create(map[string]interface{}{
		"amount":   amount,
		"currency": currency,
	}, nil)
	if err != nil {
		return "", err
	}

	fmt.Println("New Order: ", order)

	orderId, ok := order["id"].(string)
	if !ok {
		return "", fmt.Errorf("failed to convert order id to string")
	}

	// store order in postgres sql in future
	// call repo method here to store order details in db

	return orderId, nil
}

func (p *payementService) VerifyPayement(ctx context.Context, data model.VerifyPaymentRequest) (bool, error) {
	// verification logic to be added

	if data.PaymentId == "" || data.OrderId == "" || data.Signature == "" {
		return false, fmt.Errorf("all fields are required for verification")
	}

	signature := data.OrderId + "|" + data.PaymentId

	h := hmac.New(sha256.New, []byte(os.Getenv("RAZORPAY_SECRET")))
	h.Write([]byte(signature))

	expectedSignature := hex.EncodeToString(h.Sum(nil))

	return expectedSignature == data.Signature, nil
}

func NewPaymentService(repo repository.PayementRepository) PaymentService {
	return &payementService{
		repo: repo,
	}
}
