package dto

import "restaurant_manager/src/domain/models"

type Ingredient struct {
	Name   string  `json:"name"`
	Price  float64 `json:"price"`
	Amount float64 `json:"amount"`
	Unit   string  `json:"unit"`
}

func (i *Ingredient) ToModel() *models.Ingredient {
	return &models.Ingredient{
		Name:   i.Name,
		Price:  i.Price,
		Amount: i.Amount,
		Unit:   i.Unit,
	}
}

func FromModelIngredient(ingredient *models.Ingredient) *Ingredient {
	return &Ingredient{
		Name:   ingredient.Name,
		Price:  ingredient.Price,
		Amount: ingredient.Amount,
		Unit:   ingredient.Unit,
	}
}
