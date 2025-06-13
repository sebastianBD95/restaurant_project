package repositories

import (
	"restaurant_manager/src/domain/models"
)

type IngredientsRepository interface {
	CreateIngredients(ingredients []models.Ingredient) ([]string, error)
	GetIngredients() ([]*models.Ingredient, error)
	GetIngredientsByRestaurantID(restaurantID string) ([]models.RawIngredient, error)
	DeleteIngredients(ingredients []models.Ingredient) error
}
