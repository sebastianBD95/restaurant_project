package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/application/utils"
	"restaurant_manager/src/domain/models"
	"strconv"

	"github.com/gorilla/mux"
)

type MenuHandler struct {
	service *services.MenuService
}

func NewMenuHandler(service *services.MenuService) *MenuHandler {
	return &MenuHandler{service: service}
}

// Add a menu item
func (h *MenuHandler) AddMenuItem(w http.ResponseWriter, r *http.Request) {
	owner := utils.TokenVerification(r, w)
	restaurantID := mux.Vars(r)["restaurant_id"]
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		http.Error(w, "Unable to parse form", http.StatusBadRequest)
		return
	}
	name := r.FormValue("name")
	description := r.FormValue("description")
	category := r.FormValue("category")
	price, err := strconv.ParseFloat(r.FormValue("price"), 64)
	if err != nil {
		http.Error(w, "Invalid Price", http.StatusBadRequest)
		return
	}
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

	menuItem := models.MenuItem{
		RestaurantID: restaurantID,
		Name:         name,
		Description:  description,
		ImageURL:     imageURL,
		Available:    true,
		Price:        price,
		Category:     models.Category(category),
	}
	menuItemID, err := h.service.AddMenuItem(&menuItem)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"menu_item_id": menuItemID})
}

func (h *MenuHandler) GetAllMenuItems(w http.ResponseWriter, r *http.Request) {
	_ = utils.TokenVerification(r, w)
	menuID := mux.Vars(r)["restaurant_id"]
	menus, err := h.service.GetMenuItems(menuID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(menus)
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
