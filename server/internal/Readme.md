# Go Lang Backend 

myapp/
├── cmd/myapp/main.go                   // Entry point
├── internal/app/app.go                 // Bootstrap, DB connection
├── internal/config/config.go           // Loads config/env
├── internal/models/todo.go             // Todo model
├── internal/repository/todo.go         // MongoDB CRUD
├── internal/service/todo.go            // Business logic
├── internal/handlers/todo.go           // HTTP handlers
├── internal/server/server.go           // Server, routes
├── go.mod
└── Readme.md