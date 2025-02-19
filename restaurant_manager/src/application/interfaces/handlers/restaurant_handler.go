package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/domain/models"

	"github.com/gorilla/mux"
)

type RestaurantHandler struct {
	service *services.RestaurantService
}

func NewRestaurantHandler(service *services.RestaurantService) *RestaurantHandler {
	return &RestaurantHandler{service: service}
}

// Create a new restaurant
func (h *RestaurantHandler) CreateRestaurant(w http.ResponseWriter, r *http.Request) {
	var restaurant models.Restaurant
	json.NewDecoder(r.Body).Decode(&restaurant)
	restaurantID, err := h.service.CreateRestaurant(&restaurant)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"restaurant_id": restaurantID})
}

// Get restaurant details
func (h *RestaurantHandler) GetRestaurant(w http.ResponseWriter, r *http.Request) {
	restaurantID := mux.Vars(r)["restaurant_id"]
	restaurant, err := h.service.GetRestaurant(restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(restaurant)
}

// Update restaurant
func (h *RestaurantHandler) UpdateRestaurant(w http.ResponseWriter, r *http.Request) {
	var restaurant models.Restaurant
	json.NewDecoder(r.Body).Decode(&restaurant)
	err := h.service.UpdateRestaurant(&restaurant)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusOK)
}

// Delete restaurant
func (h *RestaurantHandler) DeleteRestaurant(w http.ResponseWriter, r *http.Request) {
	restaurantID := mux.Vars(r)["restaurant_id"]
	err := h.service.DeleteRestaurant(restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusNoContent)
}
