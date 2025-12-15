package repository

import (
	"context"
	"fmt"
	"log"

	// "encoding/json"
	// "fmt"
	// "time"

	"github.com/google/uuid"
	"github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/model"
	// "github.com/redis/go-redis/v9"
)

type PayementRepository interface {
	// define methods for payment repository
	CreateOrder(amount float64, currency string, userId string, razorPayId string) (string, error)
	CancelOrder(ctx context.Context, orderId string) error
	CreatePayment(ctx context.Context, orderId string, paymentId string, signature string, event string) (string, error)
	CancelPayment(ctx context.Context, paymentId string) error
	RazorPayWebhook(ctx context.Context, payload model.RazorPayWebhookPayload) error
}

type payementRepository struct {
}

func (p *payementRepository) CreateOrder(amount float64, currency string, userId string, razorPayId string) (string, error) {
	// implement the method to create payment in the database

	id := uuid.New().String()
	// Default plan name for now, you might want to pass this as an argument
	planName := "PRO_MONTHLY"

	query := "INSERT INTO orders (id, amount, currency, user_id, razorpay_order_id, plan_name) VALUES ($1, $2, $3, $4, $5, $6)"
	_, err := config.PostgresPool.Exec(context.Background(), query, id, amount, currency, userId, razorPayId, planName)
	if err != nil {
		return "", err
	}

	return "payment_created_successfully", nil
}

func (p *payementRepository) CancelOrder(ctx context.Context, orderId string) error {
	// implement the method to cancel payment in the database
	query := "UPDATE orders SET status = $1 WHERE razorpay_order_id = $2"
	_, err := config.PostgresPool.Exec(ctx, query, "attempted", orderId)
	if err != nil {
		return err
	}

	return nil
}

func (p *payementRepository) CreatePayment(ctx context.Context, orderId string, paymentId string, signature string, event string) (string, error) {
	// implement the method to create payment record in the database
	id := uuid.New().String()

	// get currency and amount from orders table using orderId
	var orderDbId string
	var amount int64
	var currency string

	err := config.PostgresPool.QueryRow(ctx,
		"SELECT id, amount, currency FROM orders WHERE razorpay_order_id = $1",
		orderId,
	).Scan(&orderDbId, &amount, &currency)

	query := "INSERT INTO payments (id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, order_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)"
	cmd, err := config.PostgresPool.Exec(ctx, query, id, orderId, paymentId, signature, amount, currency, event, orderDbId)
	if err != nil {
		return "", err
	}
	log.Printf("[payments] created payment row: paymentId=%s orderId=%s status=%s rows=%d", paymentId, orderId, event, cmd.RowsAffected())

	// // Just for testing, in real scenario status will be updated via webhook
	// // set payment status to 'created' in the database
	// query = "UPDATE payments SET status = $1 WHERE razorpay_payment_id = $2"
	// _, err = config.PostgresPool.Exec(ctx, query, "created", paymentId)
	// if err != nil {
	// 	return "", err
	// }

	// get user_id from orders table
	query = "SELECT user_id FROM orders WHERE razorpay_order_id = $1"
	var userId string
	err = config.PostgresPool.QueryRow(ctx, query, orderId).Scan(&userId)

	// // get payment_db_id from payments table
	// var paymentDbId string
	// err = config.PostgresPool.QueryRow(ctx,
	// 	"SELECT id FROM payments WHERE razorpay_payment_id = $1",
	// 	paymentId,
	// ).Scan(&paymentDbId)

	// // add subcription entry in subscriptions table
	// query = "INSERT INTO subscriptions (id, user_id, plan_name, started_at, expires_at, is_active, order_id, payment_id) VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '1 month', $4, $5, $6)"
	// subscriptionId := uuid.New().String()
	// _, err = config.PostgresPool.Exec(ctx, query, subscriptionId, userId, "PRO_MONTHLY", true, orderDbId, paymentDbId)
	// if err != nil {
	// 	return "", err
	// }

	// Invalidate the cache so the next read fetches fresh data from DB
	rdb := config.RedisClient
	cacheKey := "user:plan:" + userId
	rdb.Del(context.Background(), cacheKey)

	return "payment_record_created_successfully", nil
}

func (p *payementRepository) CancelPayment(ctx context.Context, paymentId string) error {
	// implement the method to cancel payment record in the database
	query := "UPDATE payments SET status = $1 WHERE razorpay_payment_id = $2"
	cmd, err := config.PostgresPool.Exec(ctx, query, "payment.failed", paymentId)
	if err != nil {
		return err
	}
	log.Printf("[payments] cancel update: paymentId=%s rows=%d", paymentId, cmd.RowsAffected())

	return nil
}

func (p *payementRepository) RazorPayWebhook(ctx context.Context, payload model.RazorPayWebhookPayload) error {
	eventType := payload.Event

	paymentRaw, ok := payload.Payload["payment"].(map[string]any)
	if !ok {
		return fmt.Errorf("invalid payload: missing payment object")
	}
	entity, ok := paymentRaw["entity"].(map[string]any)
	if !ok {
		return fmt.Errorf("invalid payload: missing payment entity")
	}

	paymentId, _ := entity["id"].(string)
	orderId, _ := entity["order_id"].(string)
	status, _ := entity["status"].(string)
	if paymentId == "" || orderId == "" || status == "" {
		return fmt.Errorf("invalid payload: missing id/order_id/status")
	}

	switch eventType {
	case "payment.captured":

		// create transaction
		tsx, err := config.PostgresPool.Begin(ctx)
		if err != nil {
			return err
		}

		// this will rollback the transaction in case of error
		defer tsx.Rollback(ctx)

		// update payment status to 'captured' in the database
		query := "UPDATE payments SET status = $1 WHERE razorpay_payment_id = $2 AND razorpay_order_id = $3"
		cmd, err := tsx.Exec(ctx, query, eventType, paymentId, orderId)
		if err != nil {
			return err
		}
		log.Printf("[webhook] payment.captured update rows=%d for paymentId=%s orderId=%s", cmd.RowsAffected(), paymentId, orderId)
		if cmd.RowsAffected() == 0 {
			// Webhook arrived before verify created row, insert now
			log.Printf("[webhook] inserting payment row for paymentId=%s as it does not exist yet", paymentId)
			var orderDbId string
			var amount int64
			var currency string
			if err = tsx.QueryRow(ctx,
				"SELECT id, amount, currency FROM orders WHERE razorpay_order_id = $1",
				orderId,
			).Scan(&orderDbId, &amount, &currency); err != nil {
				return fmt.Errorf("fetch order for insert failed: %w", err)
			}
			_, err = tsx.Exec(ctx,
				"INSERT INTO payments (id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, order_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (razorpay_payment_id) DO UPDATE SET status=excluded.status",
				uuid.New().String(), orderId, paymentId, "webhook", amount, currency, eventType, orderDbId,
			)
			if err != nil {
				return fmt.Errorf("insert payment from webhook failed: %w", err)
			}
		}

		// get user_id from orders table
		query = "SELECT user_id FROM orders WHERE razorpay_order_id = $1"
		var userId string
		if err = tsx.QueryRow(ctx, query, orderId).Scan(&userId); err != nil {
			return err
		}

		// get order_db_id from orders table
		var orderDbId string
		err = tsx.QueryRow(ctx,
			"SELECT id FROM orders WHERE razorpay_order_id = $1",
			orderId,
		).Scan(&orderDbId)
		if err != nil {
			return err
		}

		// get payment_db_id from payments table
		var paymentDbId string
		err = tsx.QueryRow(ctx,
			"SELECT id FROM payments WHERE razorpay_payment_id = $1",
			paymentId,
		).Scan(&paymentDbId)
		if err != nil {
			return err
		}

		// add into the subscriptions table
		query = "INSERT INTO subscriptions (id, user_id, plan_name,started_at, expires_at, is_active, order_id, payment_id) VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '1 month', $4, $5, $6)"
		subscriptionId := uuid.New().String()
		_, err = tsx.Exec(ctx, query, subscriptionId, userId, "PRO_MONTHLY", true, orderDbId, paymentDbId)
		if err != nil {
			return err
		}

		// after all operations, commit the transaction
		err = tsx.Commit(ctx)
		if err != nil {
			return err
		}

		// Invalidate cache for user's plan after successful capture
		rdb := config.RedisClient
		cacheKey := "user:plan:" + userId
		rdb.Del(context.Background(), cacheKey)
		log.Printf("[cache] invalidated %s after capture", cacheKey)

	case "payment.failed":
		// update payment status to 'failed' in the database
		query := "UPDATE payments SET status = $1 WHERE razorpay_payment_id = $2 AND razorpay_order_id = $3"
		cmd, err := config.PostgresPool.Exec(ctx, query, status, paymentId, orderId)
		if err != nil {
			return err
		}
		log.Printf("[webhook] payment.failed update rows=%d for paymentId=%s orderId=%s", cmd.RowsAffected(), paymentId, orderId)
		if cmd.RowsAffected() == 0 {
			// Insert failed payment if missing
			var orderDbId string
			var amount int64
			var currency string
			if err = config.PostgresPool.QueryRow(ctx,
				"SELECT id, amount, currency FROM orders WHERE razorpay_order_id = $1",
				orderId,
			).Scan(&orderDbId, &amount, &currency); err != nil {
				return fmt.Errorf("fetch order for failed insert: %w", err)
			}
			_, err = config.PostgresPool.Exec(ctx,
				"INSERT INTO payments (id, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, order_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT (razorpay_payment_id) DO UPDATE SET status=excluded.status",
				uuid.New().String(), orderId, paymentId, "webhook", amount, currency, status, orderDbId,
			)
			if err != nil {
				return fmt.Errorf("insert failed payment row: %w", err)
			}
		}

		// get user_id from orders table
		query = "SELECT user_id FROM orders WHERE razorpay_order_id = $1"
		var userId string
		if err = config.PostgresPool.QueryRow(ctx, query, orderId).Scan(&userId); err != nil {
			return err
		}

		// Invalidate cache for user's plan after payment failure
		rdb := config.RedisClient
		cacheKey := "user:plan:" + userId
		rdb.Del(context.Background(), cacheKey)
		log.Printf("[cache] invalidated %s after failure", cacheKey)

	default:
		return fmt.Errorf("unhandled event type: %s", eventType)
	}

	return nil
}

func NewPayementRepository() PayementRepository {
	return &payementRepository{}
}
