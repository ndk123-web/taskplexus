package config

import (
	"fmt"
	"log"
	"os"
	razorpay "github.com/razorpay/razorpay-go"
)

type RazorPayConfig struct {
	Client *razorpay.Client
}

var RazorPay *RazorPayConfig

func InitRazorPay() {
	key := os.Getenv("RAZORPAY_KEY")
	secret := os.Getenv("RAZORPAY_SECRET")

	if key == "" || secret == "" {
		log.Fatal("RAZORPAY_KEY and RAZORPAY_SECRET environment variables are required")
	}

	RazorPay = &RazorPayConfig{
		Client: razorpay.NewClient(key, secret),
	}

	fmt.Println("RazorPay Initialized")
}
