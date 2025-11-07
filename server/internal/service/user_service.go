package service

import (
	"context"
	"fmt"
	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
	"github.com/ndk123-web/fast-todo/pkg/njwt"
	"golang.org/x/crypto/bcrypt"
	"os"
)

var JWTSECRET = []byte(os.Getenv("JWT_SECRET"))

type UserService interface {
	GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error)
	SignUpUser(ctx context.Context, email string, password string) (*repository.SignUpResponse, error)
	SignInUser(ctx context.Context, email string, password string) (*repository.SignUpResponse, error)
}

type userService struct {
	repo repository.UserRepository
}

func (s *userService) GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error) {
	return s.repo.GetUserTodos(ctx, userId)
}

func (s *userService) SignUpUser(ctx context.Context, email string, password string) (*repository.SignUpResponse, error) {

	// bcrypt the password
	hashedPassword, err := BcryptForPassword(password)
	if err != nil {
		return nil, err
	}

	response, err := s.repo.SignUpUser(ctx, email, hashedPassword)
	if err != nil {
		return nil, err
	}

	accessString, refreshString, err := njwt.CreateAccessAndRefreshToken(email)
	if err != nil {
		return nil, err
	}
	// inject tokens with response
	response.AccessToken = accessString
	response.RefreshToken = refreshString

	return response, nil
}

func (s *userService) SignInUser(ctx context.Context, email string, password string) (*repository.SignUpResponse, error) {

	// if response is all right then
	response, err := s.repo.SignInUser(ctx, email, password)
	if err != nil {
		return nil, err
	}

	// get the accessToken and Refresh token
	accessString, refreshString, err := njwt.CreateAccessAndRefreshToken(response.Email)
	if err != nil {
		return nil, err
	}

	// inject access and refresh token to the response and send it to the handler
	response.AccessToken = accessString
	response.RefreshToken = refreshString

	return response, nil
}

func BcryptForPassword(password string) (string, error) {
	hashed, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	fmt.Println("Hashed password:", string(hashed))

	hashedString := string(hashed)
	return hashedString, nil
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{
		repo: repo,
	}
}
