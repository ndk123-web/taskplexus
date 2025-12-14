package repository

import (
	"context"

	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"

	"os"
	"testing"
	"time"
)

func TestGenerateFlowChartAiRepositotory(t *testing.T) {

	err := godotenv.Load("../../.env")

	if err != nil {
		t.Fatalf("Error loading .env file")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel() // prevent from memory leak

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(os.Getenv("MONGO_URI")))

	if err != nil {
		t.Fatalf("failed to connect to mongo: %v", err)
	}

	if err = client.Ping(ctx, nil); err != nil {
		t.Fatalf("mongo ping failed: %v", err)
	}

	workspaceCollection := client.Database("golangdb").Collection("workspaces")

	var obj FlowChartAiRepository = NewFlowchartAiRepository(workspaceCollection)

	workspaceId := "693c7af449c0e83196a1710f"
	userId := "693c7a7149c0e83196a17106"
	prompt := "I want to create a flowchart for DSA Dynamic Programming topics. I want 5 nodes with easy to hard level questions and edges representing the progression."

	_, _, err = obj.GenertateFlowChart(context.Background(), workspaceId, userId, prompt)
	if err != nil {
		t.Fatalf("Something went wrong: %v", err)
	}

	t.Log("Success Run")
}
