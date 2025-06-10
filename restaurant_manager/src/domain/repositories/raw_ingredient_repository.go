package repositories

import (
	"restaurant_manager/src/domain/models"
)

type RawIngredientsRepository interface {
	GetIngredientsByCategory(category string) ([]*models.RawIngredient, error)
	BulkInsertRawIngredients(ingredients []models.RawIngredient) error
}
