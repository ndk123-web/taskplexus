package server

import (
	"log"
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/handler"
)

type Server struct {
	todoHandler handler.TodoHandler
}

func NewServer(todoHandler handler.TodoHandler) *Server {
	return &Server{
		todoHandler: todoHandler,
	}
}

func (s *Server) Start(port string) error {
	http.HandleFunc("/todos", s.todoHandler.GetTodos)
	log.Print("Server Listening on Port: ", port)

	return http.ListenAndServe(port, nil)
}
