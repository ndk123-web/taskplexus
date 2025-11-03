package middleware

import (
	"log"
	"net/http"
)

func LoggingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log.Println("Request: ", r.Method, " ", r.URL.Path)

		// call actual Handler
		next.ServeHTTP(w, r)
	})
}
