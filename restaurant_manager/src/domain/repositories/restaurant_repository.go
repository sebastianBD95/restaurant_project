package repositories

import (
	"restaurant_manager/src/domain/models"
)

type RestaurantRepository interface {
	CreateRestaurant(restaurant *models.Restaurant) (string, error)
	GetRestaurant(restaurantID string) (*models.Restaurant, error)
	UpdateRestaurant(restaurant *models.Restaurant) error
	DeleteRestaurant(restaurantID string) error
	GetAllRestaurant(ownerId string) ([]*models.Restaurant, error)
}
