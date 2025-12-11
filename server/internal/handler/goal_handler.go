package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/service"
)

type GoalHandler interface {
	GetUserGoals(w http.ResponseWriter, r *http.Request)
	CreateUserGoal(w http.ResponseWriter, r *http.Request)
	UpdateUserGoal(w http.ResponseWriter, r *http.Request)
	DeleteUserGoal(w http.ResponseWriter, r *http.Request)
	IncreamentGoalProgress(w http.ResponseWriter, r *http.Request)
	DecreamentGoalProgress(w http.ResponseWriter, r *http.Request)
}

type goalHandler struct {
	service          service.GoalService
	activitieservice service.ActivityService
}

func (h *goalHandler) GetUserGoals(w http.ResponseWriter, r *http.Request) {
	userId := r.PathValue("userId")
	workspaceId := r.PathValue("workspaceId")

	if userId == "" || workspaceId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "UserId / Workspace ID is empty in Handler"})
		return
	}

	goals, err := h.service.GetUserGoals(context.Background(), userId, workspaceId)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]any{"response": goals})
}

type createGoalReqBody struct {
	WorkspaceId string `json:"workspaceId"`
	GoalName    string `json:"goalName"`
	TargetDays  string `json:"targetDays"`
	Category    string `json:"category"`
}

func (h *goalHandler) CreateUserGoal(w http.ResponseWriter, r *http.Request) {
	var reqBody createGoalReqBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	userId := r.PathValue("userId")
	workspaceId := r.PathValue("workspaceId")

	// convert string to int
	convertedTargetDays, err := strconv.ParseInt(reqBody.TargetDays, 10, 64)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	goal, err := h.service.CreateUserGoal(context.Background(), userId, workspaceId, reqBody.GoalName, convertedTargetDays, reqBody.Category)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	go func() {

		defer func() {
			if r := recover(); r != nil {
				fmt.Println("Recovered in f", r)
			}
		}()

		var data model.HandleActivityBody
		data.Type = model.ActivityGoalCreated
		data.Metadata.Id = goal.ID.Hex()
		data.Metadata.WorkspaceId = workspaceId
		data.Metadata.Name = goal.Title

		res, err := h.activitieservice.HandleActivityEvent(context.Background(), data)
		if err != nil {
			fmt.Println("Error while creating activity for goal creation: ", err)
			panic(err)
		}

		fmt.Println("Activity created for goal creation: ", res)
	}()

	json.NewEncoder(w).Encode(map[string]any{"response": goal, "success": "true"})
}

type updateGoalBody struct {
	UpdatedGoalName   string `json:"updatedGoalName"`
	UpdatedTargetDays string `json:"updatedTargetDays"`
	UpdatedCategory   string `json:"updatedCategory"`
	Description       string `json:"description"`
	Deadline          string `json:"deadline"`
}

func (h *goalHandler) UpdateUserGoal(w http.ResponseWriter, r *http.Request) {
	var reqBody updateGoalBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]any{"Error": err.Error(), "success": "false"})
		return
	}

	if reqBody.UpdatedCategory == "" || reqBody.UpdatedGoalName == "" || reqBody.UpdatedTargetDays == "" {
		json.NewEncoder(w).Encode(map[string]any{"Error": "Category/TargetDays/GoalName is Empty", "success": "false"})
		return
	}

	goalId := r.PathValue("goalId")
	if goalId == "" {
		json.NewEncoder(w).Encode(map[string]any{"Error": "Goal Id is Empty in Handler", "success": "false"})
		return
	}

	newTargetDays, err := strconv.ParseInt(reqBody.UpdatedTargetDays, 10, 64)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]any{"Error": "Target Days Parse Error in Handler", "success": "false"})
		return
	}

	ok, err := h.service.UpdateUserGoal(context.Background(), goalId, reqBody.UpdatedGoalName, newTargetDays, reqBody.UpdatedCategory, reqBody.Description,reqBody.Deadline)
	if err != nil || !ok {
		json.NewEncoder(w).Encode(map[string]any{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"response": "Success Update Goal", "success": "true"})
}

func (h *goalHandler) DeleteUserGoal(w http.ResponseWriter, r *http.Request) {
	goalIdTobeDelete := r.PathValue("goalId")

	if goalIdTobeDelete == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Goal Id is Empty In Handler"})
		return
	}

	isDeleted, err := h.service.DeleteUserGoal(context.Background(), goalIdTobeDelete)
	if err != nil || !isDeleted {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error()})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"response": "Success Delete Goal"})
}

type increamentDecreamentGoalBody struct {
	Count string `json:"count"`
}

func (h *goalHandler) IncreamentGoalProgress(w http.ResponseWriter, r *http.Request) {
	goalId := r.PathValue("goalId")

	var reqBody increamentDecreamentGoalBody

	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		fmt.Println("Req Body: ", reqBody)
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	if goalId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Goal Id is Empty In Handler", "success": "false"})
		return
	}

	if reqBody.Count == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Count is Zero in Handler", "success": "false"})
		return
	}

	fmt.Println("Count: ", reqBody.Count)

	count, err := strconv.ParseInt(reqBody.Count, 10, 64)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Count Parse Error in Handler", "success": "false"})
		return
	}

	fmt.Println("Count after conversion", count)

	isUpdated, err := h.service.IncreamentGoalProgress(context.Background(), goalId, count)

	if err != nil || !isUpdated {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"response": "Success Increament Goal Progress", "success": "true"})
}

type decreamentGoalBody struct {
	Count string `json:"count"`
}

func (h *goalHandler) DecreamentGoalProgress(w http.ResponseWriter, r *http.Request) {
	goalId := r.PathValue("goalId")

	if goalId == "" {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Goal Id is Empty In Handler", "success": "false"})
		return
	}

	var reqBody decreamentGoalBody
	if err := json.NewDecoder(r.Body).Decode(&reqBody); err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	// convert count to int64 if needed in future
	count, err := strconv.ParseInt(reqBody.Count, 10, 64)
	if err != nil {
		json.NewEncoder(w).Encode(map[string]string{"Error": "Count Parse Error in Handler", "success": "false"})
		return
	}

	isUpdated, err := h.service.DecreamentGoalProgress(context.Background(), goalId, count)

	if err != nil || !isUpdated {
		json.NewEncoder(w).Encode(map[string]string{"Error": err.Error(), "success": "false"})
		return
	}

	json.NewEncoder(w).Encode(map[string]string{"response": "Success Decreament Goal Progress", "success": "true"})
}

func NewGoalHandler(service service.GoalService, activityService service.ActivityService) GoalHandler {
	return &goalHandler{
		service:          service,
		activitieservice: activityService,
	}
}
