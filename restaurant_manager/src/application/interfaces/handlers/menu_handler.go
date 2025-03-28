package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/domain/models"

	"github.com/gorilla/mux"
)

type MenuHandler struct {
	service *services.MenuService
}

func NewMenuHandler(service *services.MenuService) *MenuHandler {
	return &MenuHandler{service: service}
}

// Create a new menu
func (h *MenuHandler) CreateMenu(w http.ResponseWriter, r *http.Request) {
	var menu models.Menu
	json.NewDecoder(r.Body).Decode(&menu)
	menuID, err := h.service.CreateMenu(&menu)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"menu_id": menuID})
}

// Delete a menu
func (h *MenuHandler) DeleteMenu(w http.ResponseWriter, r *http.Request) {
	menuID := mux.Vars(r)["menu_id"]
	err := h.service.DeleteMenu(menuID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusNoContent)
}

// Add a menu item
func (h *MenuHandler) AddMenuItem(w http.ResponseWriter, r *http.Request) {
	menuID := mux.Vars(r)["menu_id"]
	var menuItem models.MenuItem
	json.NewDecoder(r.Body).Decode(&menuItem)
	menuItem.MenuID = menuID
	menuItemID, err := h.service.AddMenuItem(&menuItem)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"menu_item_id": menuItemID})
}

// Update a menu item
func (h *MenuHandler) UpdateMenuItem(w http.ResponseWriter, r *http.Request) {
	menuItemId := mux.Vars(r)["menu_item_id"]
	var menuItem models.MenuItem
	json.NewDecoder(r.Body).Decode(&menuItem)
	menuItem.MenuItemID = menuItemId
	err := h.service.UpdateMenuItem(&menuItem)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusOK)
}

func (h *MenuHandler) DeleteMenuItem(w http.ResponseWriter, r *http.Request) {
	menuItemId := mux.Vars(r)["menu_item_id"]
	err := h.service.DeleteMenuItem(menuItemId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusNoContent)
}
