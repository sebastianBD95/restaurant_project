package repositories

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type RestaurantRepositoryImpl struct {
	db *gorm.DB
}

func NewRestaurantRepository(db *gorm.DB) repositories.RestaurantRepository {
	return &RestaurantRepositoryImpl{db}
}

// Create a new restaurant
func (repo *RestaurantRepositoryImpl) CreateRestaurant(restaurant *models.Restaurant) (string, error) {
	result := repo.db.Clauses(clause.Returning{}).Omit("restaurant_id").Create(&restaurant)
	if result.Error != nil {
		return "", result.Error
	}
	return restaurant.RestaurantID, nil
}

// Get a restaurant by ID
func (repo *RestaurantRepositoryImpl) GetRestaurant(restaurantID string) (*models.Restaurant, error) {
	var restaurant models.Restaurant
	err := repo.db.First(&restaurant, "restaurant_id = ?", restaurantID).Error
	if err != nil {
		return nil, err
	}
	return &restaurant, nil
}

func (repo *RestaurantRepositoryImpl) GetAllRestaurant(ownerId string) ([]*models.Restaurant, error) {
	var restaurants []*models.Restaurant
	result := repo.db.Where("owner_id = ?", ownerId).Find(&restaurants)
	if result.Error != nil {
		return nil, result.Error
	}
	return restaurants, nil
}

// Update restaurant details
func (repo *RestaurantRepositoryImpl) UpdateRestaurant(restaurant *models.Restaurant) error {
	return repo.db.Model(&models.Restaurant{}).
		Where("restaurant_id = ?", restaurant.RestaurantID).
		Updates(restaurant).Error
}

// Delete a restaurant
func (repo *RestaurantRepositoryImpl) DeleteRestaurant(restaurantID string) error {
	return repo.db.Delete(&models.Restaurant{}, "restaurant_id = ?", restaurantID).Error
}

func (repo *RestaurantRepositoryImpl) GetRestaurantsByOwner(ownerID string) ([]models.Restaurant, error) {
	var restaurants []models.Restaurant
	err := repo.db.Where("owner_id = ?", ownerID).Find(&restaurants).Error
	return restaurants, err
}
