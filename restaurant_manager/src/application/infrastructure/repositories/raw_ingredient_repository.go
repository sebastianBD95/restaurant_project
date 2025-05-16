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
