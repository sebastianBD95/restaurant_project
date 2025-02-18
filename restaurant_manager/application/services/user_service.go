package services

import (
	"errors"
	"restaurant_manager/domain/models"
	"restaurant_manager/domain/repositories"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) *UserService {
	return &UserService{repo: repo}
}

// RegisterUser creates a new user
func (s *UserService) RegisterUser(user *models.User) (string, error) {
	// Ensure email is unique
	existingUser, _ := s.repo.GetUserByEmail(user.Email)
	if existingUser != nil {
		return "", errors.New("email already registered")
	}

	return s.repo.CreateUser(user)
}

// LoginUser authenticates a user
func (s *UserService) LoginUser(email, password string) (*models.User, error) {
	user, err := s.repo.GetUserByEmail(email)
	if err != nil {
		return nil, errors.New("invalid credentials")
	}

	// Compare passwords
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)); err != nil {
		return nil, errors.New("invalid credentials")
	}

	return user, nil
}
