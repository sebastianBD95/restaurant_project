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

func (s *IngredientsService) CreateIngredient(ingredient []models.Ingredient) ([]string, error) {
	return s.repo.CreateIngredients(ingredient)
}

func (s *IngredientsService) GetIngredients() ([]*models.Ingredient, error) {
	return s.repo.GetIngredients()
}
