package handlers

import (
	"encoding/csv"
	"encoding/json"
	"io"
	"net/http"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/domain/models"
	"strconv"

	"github.com/gorilla/mux"
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

func (h *RawIngredientsHandler) UploadRawIngredientsCSV(w http.ResponseWriter, r *http.Request) {
	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "Restaurant ID is required", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to read file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	reader := csv.NewReader(file)
	var rawIngredients []models.RawIngredient

	// Optionally skip header
	_, _ = reader.Read()

	for {
		record, err := reader.Read()
		if err == io.EOF {
			break
		}
		if err != nil {
			http.Error(w, "Error reading CSV", http.StatusBadRequest)
			return
		}
		// CSV columns: name, category, merma
		merma, _ := strconv.ParseFloat(record[2], 64)
		rawIngredients = append(rawIngredients, models.RawIngredient{
			Name:         record[0],
			Category:     record[1],
			Merma:        merma,
			RestaurantID: restaurantID,
		})
	}

	err = h.service.BulkInsertRawIngredients(rawIngredients)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusCreated)
}

func (h *RawIngredientsHandler) UpdateRawIngredients(w http.ResponseWriter, r *http.Request) {
	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "Restaurant ID is required", http.StatusBadRequest)
		return
	}
	var ingredients []models.RawIngredient
	if err := json.NewDecoder(r.Body).Decode(&ingredients); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	if err := h.service.UpdateRawIngredients(ingredients, restaurantID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Ingredients updated successfully"})
}

func (h *RawIngredientsHandler) DeleteRawIngredients(w http.ResponseWriter, r *http.Request) {
	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "Restaurant ID is required", http.StatusBadRequest)
		return
	}
	vars := mux.Vars(r)
	id := vars["raw_ingredient_id"]
	if id == "" {
		http.Error(w, "raw_ingredient_id is required", http.StatusBadRequest)
		return
	}
	if err := h.service.DeleteRawIngredient(id); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"message": "Ingredient deleted successfully"})
}
