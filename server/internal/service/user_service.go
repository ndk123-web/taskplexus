package service

import (
	"context"
	"errors"
	"fmt"
	"os"

	"github.com/ndk123-web/fast-todo/internal/model"
	"github.com/ndk123-web/fast-todo/internal/repository"
	"github.com/ndk123-web/fast-todo/pkg/njwt"
	"golang.org/x/crypto/bcrypt"
)

var JWTSECRET = []byte(os.Getenv("JWT_SECRET"))

type UserService interface {
	GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error)
	SignUpUser(ctx context.Context, email string, password string, fullName string) (*repository.SignUpResponse, error)
	SignInUser(ctx context.Context, email string, password string) (*repository.SignUpResponse, error)
	UpdateUserName(ctx context.Context, userId string, newName string) (bool, error)
	SignInGoogleUser(ctx context.Context, email string, fullName string) (*repository.SignUpResponse, error)
	SignUpWithGoogle(ctx context.Context, email string, fullName string) (*repository.SignUpResponse, error)
}

type userService struct {
	repo repository.UserRepository
}

func (s *userService) GetUserTodos(ctx context.Context, userId string) ([]model.Todo, error) {
	return s.repo.GetUserTodos(ctx, userId)
}

func (s *userService) SignUpUser(ctx context.Context, email string, password string, fullName string) (*repository.SignUpResponse, error) {

	// bcrypt the password
	hashedPassword, err := BcryptForPassword(password)
	if err != nil {
		return nil, err
	}

	// store the user in postgres first
	_, err = s.repo.SignUpUserPostgres(ctx, email, hashedPassword, fullName)
	if err != nil {
		return nil, err
	}

	// store the user in mongo as well
	mongoResponse, err := s.repo.SignUpUserMongo(ctx, email, hashedPassword, fullName)
	if err != nil {
		// ROLLBACK: Mongo failed, delete from Postgres only (Mongo doesn't have user yet)
		deleteErr := s.repo.DeleteUserFromPostgres(ctx, email)
		if deleteErr != nil {
			// Log this critical error - manual intervention needed
			fmt.Printf("CRITICAL: Failed to rollback Postgres user after Mongo failure. Email: %s, Error: %v\n", email, deleteErr)
		}
		return nil, fmt.Errorf("mongo signup failed and postgres rolled back: %w", err)
	}

	// create access token and refresh token for the user based on email
	accessString, refreshString, err := njwt.CreateAccessAndRefreshToken(email)
	if err != nil {
		return nil, err
	}

	// inject tokens with response (use mongo response since it's the primary)
	mongoResponse.AccessToken = accessString
	mongoResponse.RefreshToken = refreshString

	return mongoResponse, nil
}

func (s *userService) SignUpWithGoogle(ctx context.Context, email string, fullName string) (*repository.SignUpResponse, error) {
	if email == "" || fullName == "" {
		return nil, errors.New("Email/FullName is Missing in Service")
	}

	// store the user in mongo first
	response, err := s.repo.SignUpWithGoogleMongo(ctx, email, fullName)
	if err != nil {
		return nil, err
	}

	// store the user in postgres as well
	_, err = s.repo.SignUpWithGooglePostgres(ctx, email, fullName, response.UserId)

	// if Postgres fails, rollback Mongo
	if err != nil {
		// ROLLBACK: Postgres failed, delete from Mongo only (Postgres doesn't have user yet)
		deleteErr := s.repo.DeleteUserByEmail(ctx, email)
		if deleteErr != nil {
			// Log this critical error - manual intervention needed
			fmt.Printf("CRITICAL: Failed to rollback Mongo user after Postgres failure. Email: %s, Error: %v\n", email, deleteErr)
		}
		return nil, fmt.Errorf("postgres signup failed and mongo rolled back: %w", err)
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

// SignInGoogleUser: assumes ID token already verified and supplies email (+ optional name)
func (s *userService) SignInGoogleUser(ctx context.Context, email string, fullName string) (*repository.SignUpResponse, error) {
	resp, err := s.repo.SignInGoogleUser(ctx, email, fullName)
	if err != nil {
		return nil, err
	}
	accessString, refreshString, err := njwt.CreateAccessAndRefreshToken(resp.Email)
	if err != nil {
		return nil, err
	}
	resp.AccessToken = accessString
	resp.RefreshToken = refreshString
	return resp, nil
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

func (s *userService) UpdateUserName(ctx context.Context, userId string, newName string) (bool, error) {
	if userId == "" || newName == "" {
		return false, fmt.Errorf("userId or newName is empty")
	}

	return s.repo.UpdateUserName(ctx, userId, newName)
}

func NewUserService(repo repository.UserRepository) UserService {
	return &userService{
		repo: repo,
	}
}
