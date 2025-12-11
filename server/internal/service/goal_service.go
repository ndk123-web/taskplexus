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
	UpdateUserGoal(ctx context.Context, goalId string, updatedGoalName string, updatedTargetDays int64, updatedCategory string, description string, deadline string) (bool, error)
	DeleteUserGoal(ctx context.Context, goalId string) (bool, error)
	IncreamentGoalProgress(ctx context.Context, goalId string, count int64) (bool, error)
	DecreamentGoalProgress(ctx context.Context, goalId string, count int64) (bool, error)
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

func (s *goalService) UpdateUserGoal(ctx context.Context, goalId string, updatedGoalName string, updatedTargetDays int64, updatedCategory string, description string, deadline string) (bool, error) {
	if goalId == "" {
		return false, errors.New("Goal Id Empty")
	}

	return s.repo.UpdateUserGoal(ctx, goalId, updatedGoalName, updatedTargetDays, updatedCategory, description,deadline)
}

func (s *goalService) DeleteUserGoal(ctx context.Context, goalId string) (bool, error) {
	if goalId == "" {
		return false, errors.New("Goal Id is Empty in Service")
	}

	return s.repo.DeleteUserGoal(ctx, goalId)
}

func (s *goalService) IncreamentGoalProgress(ctx context.Context, goalId string, count int64) (bool, error) {
	if goalId == "" {
		return false, errors.New("Goal Id is Empty in Service")
	}

	return s.repo.IncreamentGoalProgress(ctx, goalId, count)
}

func (s *goalService) DecreamentGoalProgress(ctx context.Context, goalId string, count int64) (bool, error) {
	if goalId == "" {
		return false, errors.New("Goal Id is Empty in Service")
	}

	return s.repo.DecreamentGoalProgress(ctx, goalId, count)
}

func NewGoalService(repo repository.GoalRepository) GoalService {
	return &goalService{
		repo: repo,
	}
}
