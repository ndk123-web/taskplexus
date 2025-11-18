// Package service contains business logic for todo operations
package service

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

// TodoService defines the interface for todo business logic operations
type TodoService interface {
	GetTodos(ctx context.Context) ([]model.Todo, error)
	CreateTodo(ctx context.Context, todo model.Todo, workspaceId string, userId string) (model.Todo, error)
	UpdateTodo(ctx context.Context, todoId string, updatedTask string, priority string) (model.Todo, error)
	DeleteTodo(ctx context.Context, todoId string) (bool, error)
	GetSpecificTodo(ctx context.Context, workspaceId string, userId string) ([]model.Todo, error)
	ToggleTodo(ctx context.Context, todoId string, toggle string, userId string) (bool, error)
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

func (s *todoService) ToggleTodo(ctx context.Context, todoId string, toggle string, userId string) (bool, error) {
	if todoId == "" || toggle == "" || userId == "" {
		return false, errors.New("Something is missing from userId,todoId,toggle in service")
	}
	// Delegate to repository to actually update the DB
	return s.repo.ToggleTodo(ctx, todoId, toggle, userId)
}

// CreateTodo adds a new todo item through the repository
func (s *todoService) CreateTodo(ctx context.Context, todo model.Todo, workspaceId string, userId string) (model.Todo, error) {
	return s.repo.CreateTodo(ctx, todo, workspaceId, userId)
}

// UpdateTodo modifies an existing todo's task through the repository
func (s *todoService) UpdateTodo(ctx context.Context, todoId string, updatedTask string, priority string) (model.Todo, error) {
	return s.repo.UpdateTodo(ctx, todoId, updatedTask,priority)
}

// DeleteTodo removes a todo item by ID through the repository
// Returns true if deletion was successful, false otherwise
func (s *todoService) DeleteTodo(ctx context.Context, todoId string) (bool, error) {
	return s.repo.DeleteTodo(ctx, todoId)
}

func (s *todoService) GetSpecificTodo(ctx context.Context, workspaceId string, userId string) ([]model.Todo, error) {
	if workspaceId == "" || userId == "" {
		return nil, errors.New("Workspace ID / UserId is empty in service")
	}

	var todos []model.Todo
	todos, err := s.repo.GetSpecificTodo(ctx, workspaceId, userId)

	if err != nil {
		return nil, err
	}

	return todos, nil
}
