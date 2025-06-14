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
		result := repo.db.Clauses(clause.Returning{}).Omit("ingredient_id").Create(&ingredient)
		if result.Error != nil {
			return nil, result.Error
		}
		ingredientIDs = append(ingredientIDs, ingredient.IngredientID)
	}
	return ingredientIDs, nil
}

func (repo *IngredientRepository) GetIngredients() ([]*models.Ingredient, error) {
	ingredients := []*models.Ingredient{}
	result := repo.db.Find(&ingredients)
	return ingredients, result.Error
}

func (repo *IngredientRepository) GetIngredientsByRestaurantID(restaurantID string) ([]models.RawIngredient, error) {
	var rawIngredients []models.RawIngredient
	result := repo.db.Distinct().
		Select("*").
		Table("servu.raw_ingredients").
		Where("restaurant_id = ?", restaurantID).
		Find(&rawIngredients)

	return rawIngredients, result.Error
}
func (repo *IngredientRepository) DeleteIngredients(ingredients []models.Ingredient) error {

	for _, ingredient := range ingredients {
		result := repo.db.Clauses(clause.Returning{}).Delete(&ingredient).
			Where("ingredient_id = ?", ingredient.IngredientID)
		if result.Error != nil {
			return result.Error
		}
	}
	return nil
}
