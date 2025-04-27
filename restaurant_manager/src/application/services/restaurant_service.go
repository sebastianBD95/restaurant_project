package services

import (
	"mime/multipart"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/ports"
	"restaurant_manager/src/domain/repositories"
)

type RestaurantService struct {
	repo         repositories.RestaurantRepository
	imageManager ports.StorageImageManager
}

func NewRestaurantService(repo repositories.RestaurantRepository, awsS3 ports.StorageImageManager) *RestaurantService {
	return &RestaurantService{repo: repo, imageManager: awsS3}
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

func (s *RestaurantService) UploadFile(owner string, file multipart.File) (string, error) {
	return s.imageManager.UploadImage(owner, "restaurant", "servu-web", file)
}

func (s *RestaurantService) GetAllRestaurant(OwnerID string) ([]*models.Restaurant, error) {
	return s.repo.GetAllRestaurant(OwnerID)
}
