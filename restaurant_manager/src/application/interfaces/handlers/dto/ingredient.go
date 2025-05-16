package dto

import "restaurant_manager/src/domain/models"

type Ingredient struct {
	Id     string  `json:"id"`
	Price  float64 `json:"price"`
	Amount float64 `json:"amount"`
	Unit   string  `json:"unit"`
}

func (i *Ingredient) ToModel() *models.Ingredient {
	return &models.Ingredient{
		RawIngredientID: i.Id,
		Price:           i.Price,
		Amount:          i.Amount,
		Unit:            i.Unit,
	}
}

func FromModelIngredient(ingredient *models.Ingredient) *Ingredient {
	return &Ingredient{
		Id:     ingredient.RawIngredient.ID,
		Price:  ingredient.Price,
		Amount: ingredient.Amount,
		Unit:   ingredient.Unit,
	}
}
