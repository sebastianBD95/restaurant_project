package repositories

import (
	"errors"
	"fmt"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type UserRepositoryImpl struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) repositories.UserRepository {
	return &UserRepositoryImpl{db: db}
}

// CreateUser stores a new user with a hashed password
func (repo *UserRepositoryImpl) CreateUser(user *models.User) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}

	user.PasswordHash = string(hashedPassword)

	result := repo.db.Clauses(clause.Returning{}).Omit("user_id").Create(user)
	if result.Error != nil {
		return "", result.Error
	}
	return user.UserID, nil
}

// GetUserByEmail retrieves a user by email
func (repo *UserRepositoryImpl) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	result := repo.db.Where("email = ?", email).First(&user)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			return nil, errors.New("user not found")
		}
		return nil, fmt.Errorf("failed to get user: %w", result.Error)
	}

	return &user, nil
}

// GetUsersByRestaurantID retrieves all users associated with a restaurant
func (repo *UserRepositoryImpl) GetUsersByRestaurantIDAndRole(restaurantID string, role string) ([]*models.User, error) {
	var users []*models.User
	result := repo.db.Where("restaurant_id = ? AND role = ?", restaurantID, role).Find(&users)
	if result.Error != nil {
		return nil, fmt.Errorf("failed to get users by restaurant: %w", result.Error)
	}
	return users, nil
}

func (repo *UserRepositoryImpl) UpdateUser(user *models.User) error {
	result := repo.db.Model(&models.User{}).
		Where("user_id = ?", user.UserID).
		Updates(user)
	return result.Error
}

func (repo *UserRepositoryImpl) DeleteUser(userID string) error {
	result := repo.db.Delete(&models.User{}, "user_id = ?", userID)
	return result.Error
}

func (repo *UserRepositoryImpl) GetUserById(userID string) (*models.User, error) {
	var user models.User
	result := repo.db.Where("user_id = ?", userID).First(&user)
	if result.Error != nil {
		return nil, result.Error
	}
	return &user, nil
}
