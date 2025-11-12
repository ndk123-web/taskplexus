package service

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

type GoalService interface {
	GetUserGoals(ctx context.Context, userId string, workspaceId string) ([]model.Goals, error)
	CreateUserGoal(ctx context.Context, userId string, workspaceId string, goalName string, targetDays int64, category string) (model.Goals, error)
}

type goalService struct {
	repo repository.GoalRepository
}

func (s *goalService) GetUserGoals(ctx context.Context, userId string, workspaceId string) ([]model.Goals, error) {
	if userId == "" || workspaceId == "" {
		return nil, errors.New("UserId / WorkspaceID is Empty in Service")
	}

	return s.repo.GetUserGoals(ctx, userId, workspaceId)
}

func (s *goalService) CreateUserGoal(ctx context.Context, userId string, workspaceId string, goalName string, targetDays int64, category string) (model.Goals, error) {
	if userId == "" || workspaceId == "" {
		return model.Goals{}, errors.New("UserId / WorkspaceId in Empty in Service")
	}

	return s.repo.CreateUserGoal(ctx, userId, workspaceId, goalName, targetDays, category)
}

func NewGoalService(repo repository.GoalRepository) GoalService {
	return &goalService{
		repo: repo,
	}
}
