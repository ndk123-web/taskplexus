package service

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

type AiPlannerService interface {
	HandleAiPlanner(ctx context.Context, data model.AiPlannerReqBody) (*model.AiPlanner, error)
	GetAiPlannerById(ctx context.Context, id string) (*model.AiPlanner, error)
	GetAllAiPlanners(ctx context.Context, userId string, workspaceId string) ([]model.AiPlanner, error)
}

type aiPlannerService struct {
	repo repository.AiPlannerRepository
}

func (s *aiPlannerService) HandleAiPlanner(ctx context.Context, data model.AiPlannerReqBody) (*model.AiPlanner, error) {
	if data.UserId == "" || data.WorkspaceId == "" {
		return nil, errors.New("UserId/WorkspaceId Can't Be Empty")
	}

	return s.repo.HandleAiPlanner(ctx, data)
}

func (s *aiPlannerService) GetAiPlannerById(ctx context.Context, id string) (*model.AiPlanner, error) {
	if id == "" {
		return nil, errors.New("AiPlanner ID Can't Be Empty")
	}

	return s.repo.GetAiPlannerById(ctx, id)
}

func (s *aiPlannerService) GetAllAiPlanners(ctx context.Context, userId string, workspaceId string) ([]model.AiPlanner, error) {
	if userId == "" || workspaceId == "" {
		return nil, errors.New("UserId/WorkspaceId Can't Be Empty")
	}
	return s.repo.GetAllAiPlanners(ctx, userId, workspaceId)
}

func NewAiPlannerService(repo repository.AiPlannerRepository) AiPlannerService {
	return &aiPlannerService{
		repo: repo,
	}
}
