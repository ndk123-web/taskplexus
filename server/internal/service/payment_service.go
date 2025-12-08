package service

import (
	"context"
	"fmt"

	"github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/repository"
	// "github.com/razorpay/razorpay-go"
)

type PaymentService interface {
	CreateOrder(ctx context.Context, amount string, currency string) (string, error)
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

func NewPaymentService(repo repository.PayementRepository) PaymentService {
	return &payementService{
		repo: repo,
	}
}
