package service

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

type AiPlannerService interface {
	HandleAiPlanner(ctx context.Context, data model.AiPlannerReqBody) (*model.AiPlanner, error)
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

func NewAiPlannerService(repo repository.AiPlannerRepository) AiPlannerService {
	return &aiPlannerService{
		repo: repo,
	}
}
