package dto

import "restaurant_manager/src/domain/models"

type MenuItemResponse struct {
	ID          string              `json:"menu_item_id"`
	Name        string              `json:"name"`
	Description string              `json:"description"`
	Price       float64             `json:"price"`
	Available   bool                `json:"available"`
	ImageURL    string              `json:"image_url"`
	Category    string              `json:"category"`
	SideDishes  int                 `json:"side_dishes"`
	Ingredients []IngredientSummary `json:"ingredients"`
}

type IngredientSummary struct {
	ID       string  `json:"ingredient_id"`
	Name     string  `json:"name"`
	Category string  `json:"category"`
	Price    float64 `json:"price"`
	Amount   float64 `json:"amount"`
	Unit     string  `json:"unit"`
	Merma    float64 `json:"merma"`
}

// FromMenuItems transforms a slice of MenuItem models to MenuItemResponse DTOs
func FromMenuItems(menus []models.MenuItem) []MenuItemResponse {
	response := make([]MenuItemResponse, 0, len(menus))
	for _, menu := range menus {
		response = append(response, FromMenuItem(menu))
	}
	return response
}

// FromMenuItem transforms a single MenuItem model to MenuItemResponse DTO
func FromMenuItem(menu models.MenuItem) MenuItemResponse {
	return MenuItemResponse{
		ID:          menu.MenuItemID,
		Name:        menu.Name,
		Description: menu.Description,
		Price:       menu.Price,
		Available:   menu.Available,
		ImageURL:    menu.ImageURL,
		SideDishes:  menu.SideDishes,
		Category:    string(menu.Category),
		Ingredients: fromIngredients(menu.Ingredients),
	}
}

// fromIngredients transforms a slice of Ingredient models to IngredientSummary DTOs
func fromIngredients(ingredients []models.Ingredient) []IngredientSummary {
	result := make([]IngredientSummary, 0, len(ingredients))
	for _, ing := range ingredients {
		if ing.RawIngredient != nil {
			result = append(result, IngredientSummary{
				ID:       ing.RawIngredientID,
				Name:     ing.RawIngredient.Name,
				Category: ing.RawIngredient.Category,
				Price:    ing.Price,
				Amount:   ing.Amount,
				Unit:     ing.Unit,
				Merma:    ing.RawIngredient.Merma,
			})
		}
	}
	return result
}
