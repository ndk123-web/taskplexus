package service

import (
	"context"

	"github.com/ndk123-web/fast-todo/internal/repository"
)

type ActivityService interface {
	HandleActivityEvent(ctx context.Context, data any) (any, error)
}

type activityService struct {
	repo *repository.ActivityRepository
}

func (s *activityService) HandleActivityEvent(ctx context.Context, data any) (any, error) {
	return nil, nil
}

func NewActivityService(repo *repository.ActivityRepository) ActivityService {
	return &activityService{
		repo: repo,
	}
}
