package services

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type RestaurantService struct {
	repo repositories.RestaurantRepository
}

func NewRestaurantService(repo repositories.RestaurantRepository) *RestaurantService {
	return &RestaurantService{repo: repo}
}

func (s *RestaurantService) CreateRestaurant(restaurant *models.Restaurant) (string, error) {
	return s.repo.CreateRestaurant(restaurant)
}

func (s *RestaurantService) GetRestaurant(restaurantID string) (*models.Restaurant, error) {
	return s.repo.GetRestaurant(restaurantID)
}

func (s *RestaurantService) UpdateRestaurant(restaurant *models.Restaurant) error {
	return s.repo.UpdateRestaurant(restaurant)
}

func (s *RestaurantService) DeleteRestaurant(restaurantID string) error {
	return s.repo.DeleteRestaurant(restaurantID)
}
