package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/interfaces/handlers/dto"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/application/utils"
)

type IngredientHandler struct {
	service *services.IngredientsService
}

func NewIngredientHandler(service *services.IngredientsService) *IngredientHandler {
	return &IngredientHandler{service: service}
}

func (h *IngredientHandler) GetIngredientsByRestaurantID(w http.ResponseWriter, r *http.Request) {
	// Verify token
	_ = utils.TokenVerification(r, w)

	// Get restaurant_id from query params
	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "restaurant_id is required", http.StatusBadRequest)
		return
	}

	// Get ingredients
	rawIngredients, err := h.service.GetIngredientsByRestaurantID(restaurantID)
	rawIngredientsDTO := make([]dto.RawIngredientDTO, len(rawIngredients))
	for i, rawIngredient := range rawIngredients {
		rawIngredientsDTO[i] = *dto.FromModelRawIngredient(&rawIngredient)
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Return response
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(rawIngredientsDTO)
}
