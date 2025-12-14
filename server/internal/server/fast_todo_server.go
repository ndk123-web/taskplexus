package server

import (
	"encoding/json"
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/handler"
	"github.com/ndk123-web/fast-todo/internal/middleware"
)

type Server struct {
	todoHandler         handler.TodoHandler
	userHandler         handler.UserHandler
	goalHandler         handler.GoalHandler
	workspaceHandler    handler.WorkspaceHandler
	chatHandler         handler.ChatHandler
	activityHandler     handler.ActivityHandler
	paymentHandler      handler.PayementHandler
	aiPlannerCollection handler.AiPlannerHandler
}

func NewServer(todoHandler handler.TodoHandler, userHandler handler.UserHandler, goalHandler handler.GoalHandler, workspaceHandler handler.WorkspaceHandler, chatHandler handler.ChatHandler, activityHandler handler.ActivityHandler, paymentHandler handler.PayementHandler, aiPlannerCollection handler.AiPlannerHandler) *Server {
	return &Server{
		todoHandler:         todoHandler,
		userHandler:         userHandler,
		goalHandler:         goalHandler,
		workspaceHandler:    workspaceHandler,
		chatHandler:         chatHandler,
		activityHandler:     activityHandler,
		paymentHandler:      paymentHandler,
		aiPlannerCollection: aiPlannerCollection,
	}
}

func (s *Server) Start(port string) error {

	// custom mux (not default mux)
	// in short its custom router
	mux := http.NewServeMux()

	// For Admin Purpose
	mux.Handle("GET /api/v1/todos/all-user-todos", middleware.AuthMiddleware(http.HandlerFunc((s.todoHandler.GetTodos))))

	// we need to add here JWT Middleware
	mux.Handle("POST /api/v1/users/{userId}/create-todo/{workspaceId}", middleware.AuthMiddleware(http.HandlerFunc(s.todoHandler.CreateTodo))) // using workspaceId and UserId can add the todo
	mux.Handle("PUT /api/v1/todos/update-todo", middleware.AuthMiddleware((http.HandlerFunc(s.todoHandler.UpdateTodo))))                       // using ID of todo we can directly can update the todo
	mux.Handle("DELETE /api/v1/todos/delete-todo/{todoId}", middleware.AuthMiddleware(http.HandlerFunc(s.todoHandler.DeleteTodo)))             // using ID of todo we can directly can delte the todo
	mux.Handle("GET /api/v1/users/{userId}/get-ws-todo/{workspaceID}", middleware.AuthMiddleware(http.HandlerFunc(s.todoHandler.GetSpecificTodo)))
	mux.Handle("POST /api/v1/users/toggle-todo", middleware.AuthMiddleware(http.HandlerFunc(s.todoHandler.ToogleTodo)))
	mux.Handle("POST /api/v1/analytics/{userId}/year/{year}", middleware.AuthMiddleware(http.HandlerFunc(s.todoHandler.AnalyticsOfTodos)))
	mux.Handle("GET /api/v1/users/check-plan/{userId}", middleware.AuthMiddleware(http.HandlerFunc(s.userHandler.CheckUserPremium)))
	mux.Handle("GET /api/v1/test", http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		json.NewEncoder(w).Encode(map[string]string{"Hello": "world"})
	}))

	// Password Reset Routes
	mux.Handle("POST /api/v1/users/send-forget-password-email", http.HandlerFunc(s.userHandler.ForgetPasswordSetToken))
	mux.Handle("POST /api/v1/users/reset-password", http.HandlerFunc(s.userHandler.ResetPassword))

	// No Need Of Middleware (Signin and Signup)
	mux.HandleFunc("POST /api/v1/users/signup", s.userHandler.SignUpUser)
	mux.HandleFunc("POST /api/v1/users/signin", s.userHandler.SignInUser)
	mux.Handle("PUT /api/v1/users/update-name/{userId}", middleware.AuthMiddleware(http.HandlerFunc(s.userHandler.UpdateUserName)))

	// for the refresh token routes (Currently No Need)
	mux.HandleFunc("POST /api/v1/user/refresh-token", s.userHandler.RefreshToken)

	// Goals Routes (Need Auth Middleware)
	mux.Handle("GET /api/v1/goals/u/{userId}/get-gw/{workspaceId}", middleware.AuthMiddleware(http.HandlerFunc(s.goalHandler.GetUserGoals)))
	mux.Handle("POST /api/v1/goals/u/{userId}/create-gw/{workspaceId}", middleware.AuthMiddleware(http.HandlerFunc(s.goalHandler.CreateUserGoal)))
	mux.Handle("PUT /api/v1/goals/update-goal/{goalId}", middleware.AuthMiddleware(http.HandlerFunc(s.goalHandler.UpdateUserGoal)))
	mux.Handle("DELETE /api/v1/goals/delete-goal/{goalId}", middleware.AuthMiddleware(http.HandlerFunc(s.goalHandler.DeleteUserGoal)))
	mux.Handle("POST /api/v1/goals/increament/{goalId}", middleware.AuthMiddleware(http.HandlerFunc(s.goalHandler.IncreamentGoalProgress)))
	mux.Handle("POST /api/v1/goals/decreament/{goalId}", middleware.AuthMiddleware(http.HandlerFunc(s.goalHandler.DecreamentGoalProgress)))

	// workspace Routes (Need Auth Middleware)
	mux.Handle("GET /api/v1/workspaces/get-user-workspaces", middleware.AuthMiddleware(http.HandlerFunc(s.workspaceHandler.GetAllUserWorkspace)))
	mux.Handle("POST /api/v1/workspaces/create-workspace", middleware.AuthMiddleware(http.HandlerFunc(s.workspaceHandler.CreateWorkspace)))
	mux.Handle("PUT /api/v1/workspaces/update-workspace", middleware.AuthMiddleware(http.HandlerFunc(s.workspaceHandler.UpdateWorkspace)))
	mux.Handle("DELETE /api/v1/workspaces/delete-workspace", middleware.AuthMiddleware(http.HandlerFunc(s.workspaceHandler.DeleteWorkspace)))
	mux.Handle("PUT /api/v1/workspaces/{workspaceId}/layout", middleware.AuthMiddleware(http.HandlerFunc(s.workspaceHandler.UpdateWorkspaceLayout)))

	// chat handlers
	mux.Handle("POST /api/v1/chat/send-chat", middleware.AuthMiddleware(http.HandlerFunc(s.chatHandler.HandleAiMessage)))

	// activity handler
	mux.Handle("POST /api/v1/activity/handle-activity", middleware.AuthMiddleware(http.HandlerFunc(s.activityHandler.HandleActivityEvent)))
	mux.Handle("GET /api/v1/activity/get-activities", middleware.AuthMiddleware(http.HandlerFunc(s.activityHandler.GetActivities)))

	// payment handlers
	mux.Handle("POST /api/v1/payment/create-order", middleware.AuthMiddleware(http.HandlerFunc(s.paymentHandler.HandleCreateOrder)))
	mux.Handle("POST /api/v1/payment/verify-payment", middleware.AuthMiddleware(http.HandlerFunc(s.paymentHandler.HandleVerifyPayement)))
	mux.Handle("POST /api/v1/payment/cancel-order", middleware.AuthMiddleware(http.HandlerFunc(s.paymentHandler.HandlerCancelOrder)))
	mux.Handle("POST /api/v1/payment/cancel-payment", middleware.AuthMiddleware(http.HandlerFunc(s.paymentHandler.HandlerCancelPayment)))
	mux.Handle("POST /api/v1/payment/webhook/razorpay", http.HandlerFunc(s.paymentHandler.HandleRazorPayWebhook))

	// AI Planner Handler
	mux.Handle("POST /api/v1/aiplanner/handle-planner", middleware.AuthMiddleware(http.HandlerFunc(s.aiPlannerCollection.HandleAiPlanner)))
	mux.Handle("GET /api/v1/aiplanner/get-plannerbyid/{aiPlannerId}", middleware.AuthMiddleware(http.HandlerFunc(s.aiPlannerCollection.GetAiPlannerById)))
	mux.Handle("GET /api/v1/aiplanner/get-all-planner/u/{userId}/w/{workspaceId}", middleware.AuthMiddleware(http.HandlerFunc(s.aiPlannerCollection.GetAllAiPlanners)))

	// it means cors -> log -> actual handler(mux)
	// global logging and cors middleware
	wrappedMux := middleware.LoggingMiddleware(middleware.CorsMiddleware(mux))
	return http.ListenAndServe(port, wrappedMux)
}

/*
mux.m = {
   "/todos": HandlerFunc(getTodos),
   "/users": HandlerFunc(getUsers),
}

Request: /todos
↓
mux.ServeHTTP()
↓
mux.Handler() → returns HandlerFunc(getTodos)
↓
HandlerFunc.ServeHTTP()
↓
calls getTodos(w, r)

*/
