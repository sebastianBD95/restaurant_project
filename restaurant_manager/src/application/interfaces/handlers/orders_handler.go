package handlers

import (
	"encoding/json"
	"github.com/gorilla/mux"
	"net/http"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/domain/models"
)

type OrderHandler struct {
	service *services.OrderService
}

func NewOrderHandler(service *services.OrderService) *OrderHandler {
	return &OrderHandler{service}
}

func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var order *models.Order
	json.NewDecoder(r.Body).Decode(&order)
	orderID, err := h.service.CreateOrder(order)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"order_id": orderID})
}

func (h *OrderHandler) DeleteOrder(w http.ResponseWriter, r *http.Request) {
	var orderID string
	vars := mux.Vars(r)
	orderID = vars["order_id"]
	err := h.service.DeleteOrder(orderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *OrderHandler) UpdateOrder(w http.ResponseWriter, r *http.Request) {
	var orderID string
	vars := mux.Vars(r)
	orderID = vars["order_id"]
	var order *models.Order
	json.NewDecoder(r.Body).Decode(&order)
	order.OrderID = orderID
	err := h.service.UpdateOrder(order)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)

}

func (handler *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	var orderID string
	vars := mux.Vars(r)
	orderID = vars["order_id"]
	order, err := handler.service.GetOrder(orderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(order)
}
