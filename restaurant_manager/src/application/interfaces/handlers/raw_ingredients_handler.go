package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/services"
)

type RawIngredientsHandler struct {
	service *services.RawIngredientsService
}

func NewRawIngredientsHandler(service *services.RawIngredientsService) *RawIngredientsHandler {
	return &RawIngredientsHandler{service: service}
}

func (h *RawIngredientsHandler) GetByCategory(w http.ResponseWriter, r *http.Request) {
	category := r.URL.Query().Get("category")
	if category == "" {
		http.Error(w, "Category is required", http.StatusBadRequest)
		return
	}
	ingredients, err := h.service.GetIngredientsByCategory(category)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(ingredients)
}
