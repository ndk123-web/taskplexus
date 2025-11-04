package server

import (
	"net/http"

	"github.com/ndk123-web/fast-todo/internal/handler"
	"github.com/ndk123-web/fast-todo/internal/middleware"
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

	// custom mux (not default mux)
	// in short its custom router
	mux := http.NewServeMux()
	mux.HandleFunc("GET /api/v1/todos/all-user-todos", s.todoHandler.GetTodos)
	mux.HandleFunc("POST /api/v1/todos/create-todo", s.todoHandler.CreateTodo)
	// added Global LoggingMiddleware Middleware
	// mux return *ServeMux which implements Handler Interface
	// first it checks the path
	// then it runs the handler
	/*
			func (mux *ServeMux) ServeHTTP(w http.ResponseWriter, r *http.Request) {
		    	h, _ := mux.Handler(r)
		    	h.ServeHTTP(w, r)
			}

			func (mux *ServeMux) Handler(r *http.Request) (h http.Handler, pattern string) {
		    for pattern, entry := range mux.m {
		        if match(pattern, r.URL.Path) {
		            return entry.h, pattern
		        }
		    }
		    return NotFoundHandler(), ""
			}

	*/
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
