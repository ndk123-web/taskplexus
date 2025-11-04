package service

import (
	"context"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

type UserService interface {
	GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error)
}

type userService struct {
	repo repository.UserRepository
}

func (s *userService) GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error) {
	return s.repo.GetUserTodos(ctx, userId)
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{
		repo: repo,
	}
}
