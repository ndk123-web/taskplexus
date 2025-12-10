package middleware

import "net/http"

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {

		AllowedOrigins := []string{
			"http://localhost:5173",
			"http://192.168.0.103:5173",
		}

		origins := r.Header.Get("origin")
		if origins != "" {
			for _, origin := range AllowedOrigins {
				if origin == origins {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					break
				}
			}
		}

		// w.Header().Set("Access-Control-Allow-Origin", "http://192.168.0.102:5173") // specific origin allowed
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		w.Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}
