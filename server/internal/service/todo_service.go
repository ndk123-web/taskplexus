package service

import (
	"context"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

// interface which returns array of Todo & error
type TodoService interface {
	GetTodos(ctx context.Context) ([]model.Todo, error)
	CreateTodo(ctx context.Context, todo model.Todo) (model.Todo, error)
	UpdateTodo(ctx context.Context, todoId string, updatedTask string) (model.Todo, error)
	DeleteTodo(ctx context.Context, todoId string) (bool, error)
}

type todoService struct {
	repo repository.TodoRepository
}

func NewTodoService(repo repository.TodoRepository) TodoService {
	return &todoService{repo: repo}
}

func (s *todoService) GetTodos(ctx context.Context) ([]model.Todo, error) {
	return s.repo.GetAll(ctx)
}

func (s *todoService) CreateTodo(ctx context.Context, todo model.Todo) (model.Todo, error) {
	return s.repo.CreateTodo(ctx, todo)
}

func (s *todoService) UpdateTodo(ctx context.Context, todoId string, updatedTask string) (model.Todo, error) {
	return s.repo.UpdateTodo(ctx, todoId, updatedTask)
}

func (s *todoService) DeleteTodo(ctx context.Context, todoId string) (bool, error) {
	return s.repo.DeleteTodo(ctx, todoId)
}
