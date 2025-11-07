package app

import (
	"context"
	"fmt"
	"log"
	"time"

	"github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/handler"
	"github.com/ndk123-web/fast-todo/internal/repository"
	"github.com/ndk123-web/fast-todo/internal/server"
	"github.com/ndk123-web/fast-todo/internal/service"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Run() error {
	cfg, err := config.LoadConfig()
	if err != nil {
		return err
	}

	// MongoDB Atlas connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel() // prevent from memory leak

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoUri))

	if err != nil {
		return fmt.Errorf("failed to connect to mongo: %v", err)
	}

	if err = client.Ping(ctx, nil); err != nil {
		return fmt.Errorf("mongo ping failed: %v", err)
	}

	log.Println("Connected to MongoDB Atlas")

	// collection that we want
	todoCollection := client.Database("golangdb").Collection("todos")
	userCollection := client.Database("golangdb").Collection("users")
	goalCollection := client.Database("golangdb").Collection("goals")

	// todorepos
	todoRepo := repository.NewTodoRepository(todoCollection)
	todoService := service.NewTodoService(todoRepo)
	todoHandler := handler.NewTodoHandler(todoService)

	// userrepos
	userRepo := repository.NewUserRepository(todoCollection, userCollection)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	goalRepo := repository.NewGoalRepository(goalCollection)
	goalService := service.NewGoalService(goalRepo)
	goalHandler := handler.NewGoalHandler(goalService)

	srv := server.NewServer(todoHandler, userHandler, goalHandler)
	return srv.Start(cfg.Port)
}
