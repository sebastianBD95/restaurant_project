package repositories

import (
	"restaurant_manager/domain/models"
)

type UserRepository interface {
	CreateUser(user *models.User) (string, error)
	GetUserByEmail(email string) (*models.User, error)
}
