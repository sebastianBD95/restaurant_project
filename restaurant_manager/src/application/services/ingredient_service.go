package services

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type IngredientsService struct {
	repo repositories.IngredientsRepository
}

func NewIngredientsService(repo repositories.IngredientsRepository) *IngredientsService {
	return &IngredientsService{repo: repo}
}

func (s *IngredientsService) CreateIngredients(ingredients []models.Ingredient) ([]string, error) {
	return s.repo.CreateIngredients(ingredients)
}

func (s *IngredientsService) GetIngredients() ([]*models.Ingredient, error) {
	return s.repo.GetIngredients()
}

func (s *IngredientsService) DeleteIngredients(ingredients []models.Ingredient) error {
	return s.repo.DeleteIngredients(ingredients)
}

func (s *IngredientsService) GetIngredientsByRestaurantID(restaurantID string) ([]models.RawIngredient, error) {
	return s.repo.GetIngredientsByRestaurantID(restaurantID)
}
