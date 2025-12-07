package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/ndk123-web/fast-todo/internal/app"
	"github.com/ndk123-web/fast-todo/internal/config"
)

func main() {
	fmt.Println("Fast-Todo App Working...")

	// Load environment variables from .env file
	if err := godotenv.Load(); err != nil {
		// Check if we're in production where .env might not exist
		if os.Getenv("GO_ENV") != "production" {
			log.Printf("Warning: Could not load .env file: %v", err)
		}
	}

	// Verify critical environment variables
	if os.Getenv("MONGO_URI") == "" {
		log.Fatal("MONGO_URI environment variable is required")
	}
	if os.Getenv("JWT_SECRET") == "" {
		log.Fatal("JWT_SECRET environment variable is required")
	}
	if os.Getenv("REDIS_HOST") == "" {
		log.Fatal("REDIS_HOST environment variable is required")
	}

	config.InitFirebase()
	config.InitRedis()
	config.InitRazorPay()

	if err := app.Run(); err != nil {
		log.Fatal("Error In Running the App")
	}
}
