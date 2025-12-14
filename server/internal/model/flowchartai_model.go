package model

type FlowChartAiResponse struct {
	Nodes []AiFlowNode `json:"nodes"`
	Edges []AiFlowEdge `json:"edges"`
}

type AiFlowNode struct {
	Key      string             `json:"key"`
	Label    string             `json:"label"`
	Priority string             `json:"priority"`
	Position map[string]float64 `json:"position"`
}

type AiFlowEdge struct {
	Key  string `json:"key"`
	From string `json:"from"`
	To   string `json:"to"`
}
