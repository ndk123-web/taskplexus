package service

import (
	"context"
	"errors"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
)

type ChatService interface {
	HandleAiMessage(ctx context.Context, prompt string, workspaceId string, userId string) (*model.Chat, error)
	GetUserAiMessage()
}

type chatService struct {
	repo repository.ChatRepository
}

func (s *chatService) HandleAiMessage(ctx context.Context, prompt string, workspaceId string, userId string) (*model.Chat, error) {
	if prompt == "" || workspaceId == "" {
		return nil, errors.New("Prompt/WorkspaceId Should Not be Empty")
	}

	return s.repo.HandleAiMessage(ctx, prompt, workspaceId, userId)
}

func (s *chatService) GetUserAiMessage() {

}

func NewChatService(repo repository.ChatRepository) ChatService {
	return &chatService{
		repo: repo,
	}
}
