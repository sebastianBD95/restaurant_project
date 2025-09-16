package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/application/utils"
	"restaurant_manager/src/domain/models"

	"github.com/gorilla/mux"
)

type RestaurantHandler struct {
	service *services.RestaurantService
	limiter *services.FeatureLimiter
}

func NewRestaurantHandler(service *services.RestaurantService, limiter *services.FeatureLimiter) *RestaurantHandler {
	return &RestaurantHandler{service: service, limiter: limiter}
}

// Create a new restaurant
func (h *RestaurantHandler) CreateRestaurant(w http.ResponseWriter, r *http.Request) {

	owner := utils.TokenVerification(r, w)
	if owner == "" {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}
	if h.limiter != nil && !h.limiter.CanCreateRestaurant(owner) {
		http.Error(w, "Free tier limit: only 1 restaurant allowed", http.StatusPaymentRequired)
		return
	}
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}
	name := r.FormValue("name")
	description := r.FormValue("description")
	file, _, err := r.FormFile("image")

	if err != nil {
		http.Error(w, "Unable to read image", http.StatusBadRequest)
		return
	}
	defer file.Close()

	imageURL, err := h.service.UploadFile(owner, file)
	if err != nil {
		http.Error(w, "Failed to upload image to S3", http.StatusInternalServerError)
		return
	}

	// Create a new restaurant object
	restaurant := models.Restaurant{
		Name:        name,
		Description: description,
		ImageURL:    imageURL,
		OwnerID:     owner,
	}

	// Call the service to save the restaurant in the database
	restaurantID, err := h.service.CreateRestaurant(&restaurant)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Respond with the restaurant ID
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

func (h *RestaurantHandler) GetAllRestaurant(w http.ResponseWriter, r *http.Request) {
	ownerID := utils.TokenVerification(r, w)
	restaurants, err := h.service.GetAllRestaurant(ownerID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(restaurants)
}

// Update restaurant
func (h *RestaurantHandler) UpdateRestaurant(w http.ResponseWriter, r *http.Request) {
	restaurantID := mux.Vars(r)["restaurant_id"]
	var restaurant models.Restaurant
	json.NewDecoder(r.Body).Decode(&restaurant)
	restaurant.RestaurantID = restaurantID
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
