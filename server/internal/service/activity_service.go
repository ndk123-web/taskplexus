package service

import (
	"context"
	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

type MetadataStructure struct {
	Id          string `json:"id"`
	WorkspaceId string `json:"workspaceId"`
	Name        string `json:"name"`
}
type HandleActivityBody struct {
	Type     model.ActivityType `json:"type"`
	Metadata MetadataStructure  `json:"metadata"`
}

type ActivityService interface {
	HandleActivityEvent(ctx context.Context, data model.HandleActivityBody) (any, error)
	GetActivities(ctx context.Context, data model.GetActivityData) ([]model.Activity, error,int64)
}

type activityService struct {
	repo repository.ActivityRepository
}

func (s *activityService) HandleActivityEvent(ctx context.Context, data model.HandleActivityBody) (any, error) {
	return s.repo.HandleActivityEvent(ctx, data)
}

func (s *activityService) GetActivities(ctx context.Context, data model.GetActivityData) ([]model.Activity, error,int64) {
	return s.repo.GetActivities(ctx, data)
}

func NewActivityService(repo repository.ActivityRepository) ActivityService {
	return &activityService{
		repo: repo,
	}
}
