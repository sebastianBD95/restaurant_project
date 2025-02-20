package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/domain/models"

	"github.com/gorilla/mux"
)

type TableHandler struct {
	service *services.TableService
}

func NewTableHandler(service *services.TableService) *TableHandler {
	return &TableHandler{service: service}
}

// Create a new table
func (h *TableHandler) CreateTable(w http.ResponseWriter, r *http.Request) {
	var table models.Table
	json.NewDecoder(r.Body).Decode(&table)
	tableID, err := h.service.CreateTable(&table)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"table_id": tableID})
}

// Get table details
func (h *TableHandler) GetTable(w http.ResponseWriter, r *http.Request) {
	tableID := mux.Vars(r)["table_id"]
	table, err := h.service.GetTable(tableID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(table)
}

// Update table
func (h *TableHandler) UpdateTable(w http.ResponseWriter, r *http.Request) {
	var table models.Table
	json.NewDecoder(r.Body).Decode(&table)
	err := h.service.UpdateTable(&table)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusOK)
}

// Delete table
func (h *TableHandler) DeleteTable(w http.ResponseWriter, r *http.Request) {
	tableID := mux.Vars(r)["table_id"]
	err := h.service.DeleteTable(tableID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
	w.WriteHeader(http.StatusNoContent)
}
