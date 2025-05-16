package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/application/utils"
	"restaurant_manager/src/domain/models"

	"github.com/gorilla/mux"
)

type InventoryHandler struct {
	service *services.InventoryService
}

func NewInventoryHandler(service *services.InventoryService) *InventoryHandler {
	return &InventoryHandler{service: service}
}

func (h *InventoryHandler) CreateInventory(w http.ResponseWriter, r *http.Request) {
	owner := utils.TokenVerification(r, w)
	if owner == "" {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "Restaurant ID is required", http.StatusBadRequest)
		return
	}

	var inventories []models.Inventory
	if err := json.NewDecoder(r.Body).Decode(&inventories); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Set restaurant ID for all inventory items
	for i := range inventories {
		inventories[i].RestaurantID = restaurantID
	}

	inventoryIDs, err := h.service.CreateInventory(inventories)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	json.NewEncoder(w).Encode(map[string][]string{"inventory_ids": inventoryIDs})
}

func (h *InventoryHandler) GetInventory(w http.ResponseWriter, r *http.Request) {
	inventoryID := mux.Vars(r)["inventory_id"]
	inventory, err := h.service.GetInventory(inventoryID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(inventory)
}

func (h *InventoryHandler) GetInventoryByRestaurantID(w http.ResponseWriter, r *http.Request) {
	restaurantID := r.URL.Query().Get("restaurant_id")
	inventories, err := h.service.GetInventoryByRestaurantID(restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(inventories)
}

func (h *InventoryHandler) UpdateInventory(w http.ResponseWriter, r *http.Request) {
	owner := utils.TokenVerification(r, w)
	if owner == "" {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var inventories []models.Inventory
	if err := json.NewDecoder(r.Body).Decode(&inventories); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := h.service.UpdateInventory(inventories)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
}

func (h *InventoryHandler) DeleteInventory(w http.ResponseWriter, r *http.Request) {
	inventoryID := mux.Vars(r)["inventory_id"]
	err := h.service.DeleteInventory(inventoryID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
