package services

import (
	"restaurant_manager/src/application/infrastructure/repositories"
	"restaurant_manager/src/domain/models"
)

type RawIngredientsService struct {
	repository *repositories.RawIngredientsRepository
}

func NewRawIngredientsService(repository *repositories.RawIngredientsRepository) *RawIngredientsService {
	return &RawIngredientsService{repository: repository}
}

func (s *RawIngredientsService) GetIngredientsByCategory(category string) ([]*models.RawIngredient, error) {
	return s.repository.GetIngredientsByCategory(category)
}

func (s *RawIngredientsService) BulkInsertRawIngredients(ingredients []models.RawIngredient) error {
	return s.repository.BulkInsertRawIngredients(ingredients)
}

func (s *RawIngredientsService) UpdateRawIngredients(ingredients []models.RawIngredient, restaurantID string) error {
	return s.repository.UpdateMany(ingredients, restaurantID)
}

func (s *RawIngredientsService) DeleteRawIngredient(id string) error {
	return s.repository.Delete(id)
}
