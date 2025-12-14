package repository

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"fmt"

	// "encoding/json"
	"github.com/ndk123-web/fast-todo/internal/model"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"google.golang.org/genai"
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
			fmt.Sprintf("Node: %s (%s)\n", n.Data["todo"].(map[string]any)["text"].(string), n.Data["todo"].(map[string]any)["priority"].(string)),
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
	// fmt.Println("Workspace Fetched: ", workspace)

	finalPrompt := fmt.Sprintf(`
	You are an intelligent flowchart assistant.

		You will receive:
		1. Existing nodes and edges of a flowchart
		2. A user instruction describing what to add or extend

		Rules:
		- Do NOT modify or repeat existing nodes
		- ONLY suggest NEW nodes and NEW edges
		- Do NOT generate database IDs
		- Use short, stable logical keys (snake_case)
		- Keys must be unique within this response
		- Each edge must connect logical keys
		- Return ONLY valid JSON, no explanation, no markdown

		Existing Nodes:
		%v

		Existing Edges:
		%v

		User Instruction:
		%v

		Response JSON format:
		{
		"nodes": [
			{
			"key": "string",
			"label": "string",
			"priority": "low | medium | high",
			"position": { "x": number, "y": number }
			}
		],
		"edges": [
			{
			"from": "node_key",
			"to": "node_key"
			}
		]
		}`, nodeBuilder.String(), edgeBuilder.String(), prompt)

	client, _ := genai.NewClient(ctx, nil)
	resp, err := client.Models.GenerateContent(
		ctx,
		"gemini-2.5-flash",
		genai.Text(finalPrompt),
		nil,
	)
	if err != nil {
		return nil, nil, err
	}

	clean := strings.TrimSpace(resp.Text())
	clean = strings.ReplaceAll(clean, "```json", "")
	clean = strings.ReplaceAll(clean, "```JSON", "")
	clean = strings.ReplaceAll(clean, "```", "")

	fmt.Println("AI Response Cleaned: ", clean)

	// Normalize
	var newNodes []model.AiFlowNode
	var newEdges []model.AiFlowEdge

	var aiResponse model.FlowChartAiResponse
	if err := json.Unmarshal([]byte(clean), &aiResponse); err != nil {
		return nil, nil, err
	}

	fmt.Println("ai Response: ", aiResponse)

	var nodeKeySet = make(map[string]primitive.ObjectID)

	for _, n := range aiResponse.Nodes {
		newId := primitive.NewObjectID()
		nodeKeySet[n.Key] = newId
		newNodes = append(newNodes, model.AiFlowNode{Key: n.Key, Priority: n.Priority, Position: n.Position, Label: n.Label})
		fmt.Printf("Node Key: %s, New ID: %s", n.Key, newId.Hex())
	}

	for _, e := range aiResponse.Edges {
		fromOid := nodeKeySet[e.From]
		toOid := nodeKeySet[e.To]

		key := fmt.Sprintf("edge-%s-%s", fromOid.Hex(), toOid.Hex())

		newEdges = append(newEdges, model.AiFlowEdge{From: fromOid.Hex(), To: toOid.Hex(), Key: key})
		fmt.Printf("Edge : %s", key)
		fmt.Printf("From: %s", fromOid.Hex())
		fmt.Printf("To: %s", toOid.Hex())
	}

	// we need to append the new nodes and edges to existing ones
	existedNodes := workspace.InitialNodes
	existedEdges := workspace.InitialEdges

	for _, n := range newNodes {
		// Get the generated ObjectID for this node key
		nodeID := nodeKeySet[n.Key]

		existedNodes = append(existedNodes, model.FlowNode{
			ID:       nodeID.Hex(),
			Type:     "todoNode",
			Position: map[string]interface{}{"x": n.Position["x"], "y": n.Position["y"]},
			Data: map[string]interface{}{
				"todo": map[string]interface{}{
					"id":          nodeID.Hex(),
					"text":        n.Label,
					"priority":    n.Priority,
					"status":      "not-started",
					"completed":   false,
					"createdAt":   time.Now(),
					"updatedAt":   time.Now(),
					"workspaceId": workspaceId,
					"description": "",
				},
			},
		})
	}

	for _, e := range newEdges {
		existedEdges = append(existedEdges, model.FlowEdge{
			Source:   e.From,
			Target:   e.To,
			ID:       e.Key,
			Animated: false,
			Style:    map[string]any{"stroke": "#667eaa", "strokeWidth": 3},
			Type:     "smoothstep",
		})
	}

	// Update the workspace with new nodes and edges
	filter := bson.M{"_id": workspaceOid, "userId": userOid}
	update := bson.M{
		"$set": bson.M{
			"initialNodes": existedNodes,
			"initialEdges": existedEdges,
		},
	}

	res, err := r.workspaceCollection.UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, nil, err
	}

	if res.MatchedCount <= 0 {
		return nil, nil, fmt.Errorf("no workspace found to update")
	}

	fmt.Println("Updated Mongo DB")

	for _, n := range existedNodes {
		fmt.Printf("Final Node ID: %s\n", n.ID)
	}

	for _, e := range existedEdges {
		fmt.Printf("Final Edge ID: %s\n", e.ID)
	}

	return existedNodes, existedEdges, nil
}

func NewFlowchartAiRepository(workspaceCollection *mongo.Collection) FlowChartAiRepository {
	return &flowchartAiRepository{
		workspaceCollection: workspaceCollection,
	}
}
