package app

import (
	"context"
	"fmt"
	"log"
	"os"
	"time"

	// "github.com/ndk123-web/fast-todo/internal/config"
	"github.com/ndk123-web/fast-todo/internal/handler"
	"github.com/ndk123-web/fast-todo/internal/repository"
	"github.com/ndk123-web/fast-todo/internal/server"
	"github.com/ndk123-web/fast-todo/internal/service"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

func Run() error {
	// cfg, err := config.LoadConfig()
	// if err != nil {
	// 	return err
	// }

	// MongoDB Atlas connection
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel() // prevent from memory leak

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(os.Getenv("MONGO_URI")))

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
	workspaceCollection := client.Database("golangdb").Collection("workspaces")
	chatCollection := client.Database("golangdb").Collection("chats")
	activityCollection := client.Database("golangdb").Collection("activities")
	aiPlannerCollection := client.Database("golangdb").Collection("aiplanners")

	// Create Indexes on Collections
	wsModel := mongo.IndexModel{
		Keys: bson.D{
			{"userId", 1},
			{"workspaceName", 1},
		},
		Options: options.Index().SetUnique(true), // prevents duplicates
	}
	workspaceCollection.Indexes().CreateOne(ctx, wsModel)

	//
	userMode := mongo.IndexModel{
		Keys: bson.D{
			{"email", 1},
		},
		Options: options.Index().SetUnique(true), // prevents duplicates
	}
	userCollection.Indexes().CreateOne(ctx, userMode)

	//
	todoModel := mongo.IndexModel{
		Keys: bson.D{
			{"userId", 1},
			{"workspaceId", 1},
		},
	}
	todoCollection.Indexes().CreateOne(ctx, todoModel)

	//
	goalModel := mongo.IndexModel{
		Keys: bson.D{
			{"userId", 1},
			{"workspaceId", 1},
		},
	}
	goalCollection.Indexes().CreateOne(ctx, goalModel)

	chatModel := mongo.IndexModel{
		Keys: bson.D{
			{"userId", 1},
			{"workspaceId", 1},
		},
	}
	chatCollection.Indexes().CreateOne(ctx, chatModel)

	aiPlannerMode := mongo.IndexModel{
		Keys: bson.D{
			{"userId", 1},
			{"workspace", 1},
		},
	}
	aiPlannerCollection.Indexes().CreateOne(ctx, aiPlannerMode)

	// userrepos
	userRepo := repository.NewUserRepository(todoCollection, userCollection)
	userService := service.NewUserService(userRepo)
	userHandler := handler.NewUserHandler(userService)

	workspaceRepo := repository.NewWorkspaceRepository(workspaceCollection)
	workspaceService := service.NewWorkSpaceService(workspaceRepo)
	workspaceHandler := handler.NewWorkspaceHandler(workspaceService)

	chatRepo := repository.NewChatRepository(todoCollection, goalCollection, workspaceCollection, chatCollection)
	chatService := service.NewChatService(chatRepo)
	chatHandler := handler.NewChatHandler(chatService)

	activitiyRepo := repository.NewActivityRepository(goalCollection, todoCollection, activityCollection)
	activityService := service.NewActivityService(activitiyRepo)
	activityHandler := handler.NewActivityHandler(activityService)

	goalRepo := repository.NewGoalRepository(goalCollection)
	goalService := service.NewGoalService(goalRepo)
	goalHandler := handler.NewGoalHandler(goalService, activityService)
	// todorepos
	todoRepo := repository.NewTodoRepository(todoCollection)
	todoService := service.NewTodoService(todoRepo)
	todoHandler := handler.NewTodoHandler(todoService, activityService)

	paymentRepo := repository.NewPayementRepository()
	paymentService := service.NewPaymentService(paymentRepo)
	paymentHandler := handler.NewPayementHandler(paymentService)

	aiPlannerRepo := repository.NewAiPlannerRepository(aiPlannerCollection, todoCollection, goalCollection)
	aiPlannerService := service.NewAiPlannerService(aiPlannerRepo)
	aiPlannerHandler := handler.NewAiPlannerHandler(aiPlannerService)

	srv := server.NewServer(todoHandler, userHandler, goalHandler, workspaceHandler, chatHandler, activityHandler, paymentHandler, aiPlannerHandler)
	return srv.Start(os.Getenv("DEVLOPMENT_PORT"))
}
