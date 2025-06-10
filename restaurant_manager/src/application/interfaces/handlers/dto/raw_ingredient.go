package dto

import "restaurant_manager/src/domain/models"

type RawIngredientDTO struct {
	ID       string  `json:"id"`
	Category string  `json:"category"`
	Name     string  `json:"name"`
	Merma    float64 `json:"merma"`
}

func (r *RawIngredientDTO) ToModel() *models.RawIngredient {
	return &models.RawIngredient{
		Category: r.Category,
		Name:     r.Name,
		Merma:    r.Merma,
	}
}

func FromModelRawIngredient(rawIngredient *models.RawIngredient) *RawIngredientDTO {
	return &RawIngredientDTO{
		ID:       rawIngredient.ID,
		Category: rawIngredient.Category,
		Name:     rawIngredient.Name,
		Merma:    rawIngredient.Merma,
	}
}
