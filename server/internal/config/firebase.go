package config

import (
	"context"
	"log"
	"os"
	"path/filepath"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"google.golang.org/api/option"
)

var FirebaseAuth *auth.Client

func InitFirebase() {
	// Use env var for credentials path; fallback to local file in config directory.
	credPath := os.Getenv("FIREBASE_CREDENTIALS_PATH")
	if credPath == "" {
		// Attempt common filename in current folder.

		// for development
		// credPath = filepath.Join("./internal/config", "taskplexus-firebase-adminsdk-fbsvc-69245eb849.json")

		// for production deployment
		credPath = filepath.Join("./", "taskplexus-firebase-adminsdk-fbsvc-69245eb849.json")
	}
	opt := option.WithCredentialsFile(credPath)

	app, err := firebase.NewApp(context.Background(), nil, opt)
	if err != nil {
		log.Fatalf("ERROR initializing Firebase: %v", err)
	}

	FirebaseAuth, err = app.Auth(context.Background())
	if err != nil {
		log.Fatalf("ERROR initializing Firebase Auth: %v", err)
	}

	log.Println("🔥 Firebase Auth Initialized")
}
