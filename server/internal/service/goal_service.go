package service

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

type GoalService interface {
	GetUserGoals(ctx context.Context, userId string) ([]model.Goals, error)
}

type goalService struct {
	repo repository.GoalRepository
}

func (s *goalService) GetUserGoals(ctx context.Context, userId string) ([]model.Goals, error) {
	if userId == "" {
		return nil, errors.New("UserId is Empty")
	}

	return s.repo.GetUserGoals(ctx, userId)
}

func NewGoalService(repo repository.GoalRepository) GoalService {
	return &goalService{
		repo: repo,
	}
}
