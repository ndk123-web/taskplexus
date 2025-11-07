package server

import (
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/handler"
	"github.com/ndk123-web/fast-todo/internal/middleware"
)

type Server struct {
	todoHandler handler.TodoHandler
	userHandler handler.UserHandler
}

func NewServer(todoHandler handler.TodoHandler, userHandler handler.UserHandler) *Server {
	return &Server{
		todoHandler: todoHandler,
		userHandler: userHandler,
	}
}

func (s *Server) Start(port string) error {

	// custom mux (not default mux)
	// in short its custom router
	mux := http.NewServeMux()
	mux.Handle("GET /api/v1/todos/all-user-todos", middleware.AuthMiddleware(http.HandlerFunc((s.todoHandler.GetTodos))))

	// we need to add here JWT Middleware
	mux.HandleFunc("POST /api/v1/todos/create-todo", s.todoHandler.CreateTodo)
	mux.HandleFunc("PUT /api/v1/todos/update-todo", s.todoHandler.UpdateTodo)
	mux.HandleFunc("DELETE /api/v1/todos/delete-todo", s.todoHandler.DeleteTodo)

	// middleware for Get User Todos
	mux.Handle("GET /api/v1/todos/get-user-todos", middleware.AuthMiddleware(http.HandlerFunc(s.userHandler.GetUserTodos)))
	mux.HandleFunc("POST /api/v1/users/signup", s.userHandler.SignUpUser)
	
	// for the refresh token 
	mux.HandleFunc("POST /api/v1/user/refresh-token", s.userHandler.RefreshToken)
	
	wrappedMux := middleware.LoggingMiddleware(mux)
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
