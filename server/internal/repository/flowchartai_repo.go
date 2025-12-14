package repository

import (
	"context"
	"strings"

	"fmt"

	// "encoding/json"
	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	// "google.golang.org/genai"
)

type FlowChartAiRepository interface {
	GenertateFlowChart(ctx context.Context, workspaceId string, userId string, prompt string) ([]model.FlowNode, []model.FlowEdge, error)
}

type flowchartAiRepository struct {
	workspaceCollection *mongo.Collection
}

func (r *flowchartAiRepository) GenertateFlowChart(
	ctx context.Context,
	workspaceId string,
	userId string,
	prompt string,
) ([]model.FlowNode, []model.FlowEdge, error) {

	workspaceOid, err := primitive.ObjectIDFromHex(workspaceId)
	if err != nil {
		return nil, nil, err
	}
	userOid, err := primitive.ObjectIDFromHex(userId)
	if err != nil {
		return nil, nil, err
	}

	var workspace model.Workspace
	err = r.workspaceCollection.FindOne(ctx, bson.M{
		"_id":    workspaceOid,
		"userId": userOid,
	}).Decode(&workspace)
	if err != nil {
		return nil, nil, err
	}

	var nodeBuilder strings.Builder
	for _, n := range workspace.InitialNodes {
		nodeBuilder.WriteString(
			fmt.Sprintf("Node: %s (%s)\n", n.Data["todo"].(map[string]any)["text"].(string), n.Data["todo"].(map[string]any)["priority"]),
		)
	}

	var edgeBuilder strings.Builder
	for _, e := range workspace.InitialEdges {
		edgeBuilder.WriteString(
			fmt.Sprintf("Edge: %s -> %s\n", e.Source, e.Target),
		)
	}

	fmt.Println("Node Builder", nodeBuilder.String())
	fmt.Println("Edge Builder", edgeBuilder.String())
	fmt.Println("Prompt", prompt)
	fmt.Println("Workspace Fetched: ", workspace)

	// finalPrompt := fmt.Sprintf(`
	// You are an intelligent flowchart assistant.

	// 	You will receive:
	// 	1. Existing nodes and edges of a flowchart
	// 	2. A user instruction describing what to add or extend

	// 	Rules:
	// 	- Do NOT modify or repeat existing nodes
	// 	- ONLY suggest NEW nodes and NEW edges
	// 	- Do NOT generate database IDs
	// 	- Use short, stable logical keys (snake_case)
	// 	- Keys must be unique within this response
	// 	- Each edge must connect logical keys
	// 	- Return ONLY valid JSON, no explanation, no markdown

	// 	Existing Nodes:
	// 	%v 

	// 	Existing Edges:
	// 	%v 

	// 	User Instruction:
	// 	%v 

	// 	Response JSON format:
	// 	{
	// 	"nodes": [
	// 		{
	// 		"key": "string",
	// 		"label": "string",
	// 		"priority": "low | medium | high",
	// 		"position": { "x": number, "y": number }
	// 		}
	// 	],
	// 	"edges": [
	// 		{
	// 		"from": "node_key",
	// 		"to": "node_key"
	// 		}
	// 	]
	// 	}`, nodeBuilder.String(), edgeBuilder.String(), prompt)

	// client, _ := genai.NewClient(ctx, nil)
	// resp, err := client.Models.GenerateContent(
	// 	ctx,
	// 	"gemini-2.5-flash",
	// 	genai.Text(finalPrompt),
	// 	nil,
	// )
	// if err != nil {
	// 	return nil, nil, err
	// }

	// clean := strings.TrimSpace(resp.Text())
	// clean = strings.ReplaceAll(clean, "```json", "")
	// clean = strings.ReplaceAll(clean, "```", "")

	return nil, nil, nil
}

func NewFlowchartAiRepository(workspaceCollection *mongo.Collection) FlowChartAiRepository {
	return &flowchartAiRepository{
		workspaceCollection: workspaceCollection,
	}
}
