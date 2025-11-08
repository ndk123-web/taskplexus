package service

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

type WorkspaceService interface {
	GetAllUserWorkspaces(ctx context.Context, userId string) ([]model.Workspace, error)
}

type workspaceService struct {
	repo repository.WorkSpaceRepository
}

func (s *workspaceService) GetAllUserWorkspace(ctx context.Context, userId string) ([]model.Workspace, error) {
	if userId == "" {
		return nil, errors.New("UserId is Empty in Service")
	}

	return s.repo.GetAllUserWorkspace(ctx, userId)
}
