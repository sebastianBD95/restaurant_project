package repositories

import (
	"restaurant_manager/src/domain/models"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type IngredientRepository struct {
	db *gorm.DB
}

func NewIngredientRepository(db *gorm.DB) *IngredientRepository {
	return &IngredientRepository{db: db}
}

func (repo *IngredientRepository) CreateIngredients(ingredients []models.Ingredient) ([]string, error) {
	ingredientIDs := []string{}
	for _, ingredient := range ingredients {
		result := repo.db.Clauses(clause.Returning{}).Omit("ingredient_id").Create(&ingredients)
		if result.Error != nil {
			return nil, result.Error
		}
		ingredientIDs = append(ingredientIDs, ingredient.Ingredient_id)
	}
	return ingredientIDs, nil
}

func (repo *IngredientRepository) GetIngredients() ([]*models.Ingredient, error) {
	ingredients := []*models.Ingredient{}
	result := repo.db.Find(&ingredients)
	return ingredients, result.Error
}
