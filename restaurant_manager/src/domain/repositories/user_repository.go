package repositories

import (
	"restaurant_manager/src/domain/models"
)

type UserRepository interface {
	CreateUser(user *models.User) (string, error)
	GetUserByEmail(email string) (*models.User, error)
	GetUsersByRestaurantIDAndRole(restaurantID string, role string) ([]*models.User, error)
	UpdateUser(user *models.User) error
}
