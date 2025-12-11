package service

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"os"
	"strconv"

	"github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
	// "github.com/razorpay/razorpay-go"
)

type PaymentService interface {
	CreateOrder(ctx context.Context, amount string, currency string, userId string) (string, error)
	VerifyPayement(ctx context.Context, data model.VerifyPaymentRequest) (bool, error)
	CancelOrder(ctx context.Context, orderId string) error
	CancelPayment(ctx context.Context, paymentId string) error
}

type payementService struct {
	repo repository.PayementRepository
}

func (p *payementService) CreateOrder(ctx context.Context, amount string, currency string, userId string) (string, error) {
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

	amountFloat, err := strconv.ParseFloat(amount, 64)
	if err != nil {
		return "", fmt.Errorf("invalid amount format")
	}

	// store order in postgres sql in future
	// call repo method here to store order details in db
	_, err = p.repo.CreateOrder(amountFloat, currency, userId, orderId)
	if err != nil {
		return "", err
	}

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

	if expectedSignature != data.Signature {
		if err := p.repo.CancelPayment(ctx, data.PaymentId); err != nil {
			return false, fmt.Errorf("failed to cancel payment after signature mismatch: %v", err)
		}
		return false, fmt.Errorf("invalid payment signature")
	}

	// create payment record in the database
	_, err := p.repo.CreatePayment(ctx, data.OrderId, data.PaymentId, data.Signature)
	if err != nil {
		// marked as failed in future
		if err := p.repo.CancelPayment(ctx, data.PaymentId); err != nil {
			return false, fmt.Errorf("failed to cancel payment after create payment error: %v", err)
		}
		return false, err
	}
	return true, nil
}

func (p *payementService) CancelOrder(ctx context.Context, orderId string) error {
	// cancellation logic to be added in future

	if orderId == "" {
		return fmt.Errorf("orderId is required for cancellation")
	}

	return p.repo.CancelOrder(ctx, orderId)
}

func (p *payementService) CancelPayment(ctx context.Context, paymentId string) error {
	// cancellation logic to be added in future
	if paymentId == "" {
		return fmt.Errorf("paymentId is required for cancellation")
	}

	return p.repo.CancelPayment(ctx, paymentId)
}

func NewPaymentService(repo repository.PayementRepository) PaymentService {
	return &payementService{
		repo: repo,
	}
}
