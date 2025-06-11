package repositories

import (
	"restaurant_manager/src/domain/models"

	"gorm.io/gorm"
)

type RawIngredientsRepository struct {
	db *gorm.DB
}

func NewRawIngredientsRepository(db *gorm.DB) *RawIngredientsRepository {
	return &RawIngredientsRepository{db: db}
}

func (r *RawIngredientsRepository) GetIngredientsByCategory(category string) ([]*models.RawIngredient, error) {
	var ingredients []*models.RawIngredient
	if err := r.db.Where("category = ?", category).Find(&ingredients).Error; err != nil {
		return nil, err
	}
	return ingredients, nil
}

func (r *RawIngredientsRepository) BulkInsertRawIngredients(ingredients []models.RawIngredient) error {
	return r.db.Omit("raw_ingredient_id").Create(&ingredients).Error
}

func (r *RawIngredientsRepository) UpdateMany(ingredients []models.RawIngredient, restaurantID string) error {
	for _, ingredient := range ingredients {
		result := r.db.Model(&models.RawIngredient{}).
			Where("raw_ingredient_id = ? AND restaurant_id = ?", ingredient.ID, restaurantID).
			Updates(map[string]interface{}{
				"name":     ingredient.Name,
				"category": ingredient.Category,
				"merma":    ingredient.Merma,
			})
		if result.Error != nil {
			return result.Error
		}
	}
	return nil
}

func (r *RawIngredientsRepository) Delete(id string) error {
	result := r.db.Where("id = ?", id).Delete(&models.RawIngredient{})
	return result.Error
}
