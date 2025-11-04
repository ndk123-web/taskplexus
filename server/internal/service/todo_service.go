// Package service contains business logic for todo operations
package service

import (
	"context"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

// TodoService defines the interface for todo business logic operations
type TodoService interface {
	GetTodos(ctx context.Context) ([]model.Todo, error)
	CreateTodo(ctx context.Context, todo model.Todo) (model.Todo, error)
	UpdateTodo(ctx context.Context, todoId string, updatedTask string) (model.Todo, error)
	DeleteTodo(ctx context.Context, todoId string) (bool, error)
}

// todoService implements TodoService with a repository layer dependency
type todoService struct {
	repo repository.TodoRepository // Repository for data access
}

// NewTodoService creates a new instance of TodoService with the provided repository
func NewTodoService(repo repository.TodoRepository) TodoService {
	return &todoService{repo: repo}
}

// GetTodos retrieves all todo items from the repository
func (s *todoService) GetTodos(ctx context.Context) ([]model.Todo, error) {
	return s.repo.GetAll(ctx)
}

// CreateTodo adds a new todo item through the repository
func (s *todoService) CreateTodo(ctx context.Context, todo model.Todo) (model.Todo, error) {
	return s.repo.CreateTodo(ctx, todo)
}

// UpdateTodo modifies an existing todo's task through the repository
func (s *todoService) UpdateTodo(ctx context.Context, todoId string, updatedTask string) (model.Todo, error) {
	return s.repo.UpdateTodo(ctx, todoId, updatedTask)
}

// DeleteTodo removes a todo item by ID through the repository
// Returns true if deletion was successful, false otherwise
func (s *todoService) DeleteTodo(ctx context.Context, todoId string) (bool, error) {
	return s.repo.DeleteTodo(ctx, todoId)
}
