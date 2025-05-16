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
