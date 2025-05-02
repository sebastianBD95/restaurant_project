package services

import (
	"errors"
	"fmt"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
	"strings"

	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	repo repositories.UserRepository
}

func NewUserService(repo repositories.UserRepository) *UserService {
	return &UserService{repo: repo}
}

// validateUser performs basic validation on user data
func (s *UserService) validateUser(user *models.User) error {
	if strings.TrimSpace(user.Name) == "" {
		return errors.New("name is required")
	}
	if strings.TrimSpace(user.Email) == "" {
		return errors.New("email is required")
	}
	if strings.TrimSpace(user.PasswordHash) == "" {
		return errors.New("password is required")
	}
	if strings.TrimSpace(user.Phone) == "" {
		return errors.New("phone is required")
	}
	if user.Role != "admin" && user.Role != "waiter" && user.Role != "customer" {
		return errors.New("invalid role")
	}
	return nil
}

// RegisterUser creates a new user
func (s *UserService) RegisterUser(user *models.User) (string, error) {

	// Ensure email is unique
	existingUser, _ := s.repo.GetUserByEmail(user.Email)
	if existingUser != nil {
		return "", errors.New("email already registered")
	}

	// Create the user
	userID, err := s.repo.CreateUser(user)
	if err != nil {
		return "", fmt.Errorf("failed to create user: %w", err)
	}

	return userID, nil
}

// LoginUser authenticates a user
func (s *UserService) LoginUser(email, password string) (*models.User, error) {
	if strings.TrimSpace(email) == "" || strings.TrimSpace(password) == "" {
		return nil, errors.New("email and password are required")
	}

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

// GetUsersByRestaurantID retrieves all users associated with a restaurant
func (s *UserService) GetUsersByRestaurantIDAndRole(restaurantID string, role string) ([]*models.User, error) {
	if strings.TrimSpace(restaurantID) == "" {
		return nil, errors.New("restaurant ID is required")
	}
	if strings.TrimSpace(role) == "" {
		return nil, errors.New("role is required")
	}

	users, err := s.repo.GetUsersByRestaurantIDAndRole(restaurantID, role)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by restaurant: %w", err)
	}

	return users, nil
}
