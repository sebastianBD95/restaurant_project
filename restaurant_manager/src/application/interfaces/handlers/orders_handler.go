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
		http.Error(w, err.Error(), http.StatusNotFound)
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

func (h *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	var orderID string
	vars := mux.Vars(r)
	orderID = vars["order_id"]
	order, err := h.service.GetOrder(orderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(order)
}

func (h *OrderHandler) AddOrderItem(w http.ResponseWriter, r *http.Request) {
	var orderItem models.OrderItem
	json.NewDecoder(r.Body).Decode(&orderItem)
	orderItemID, err := h.service.AddOrderItem(&orderItem)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"order_item_id": orderItemID})
}

// Update an order item
func (h *OrderHandler) UpdateOrderItem(w http.ResponseWriter, r *http.Request) {
	var orderItem models.OrderItem
	json.NewDecoder(r.Body).Decode(&orderItem)
	err := h.service.UpdateOrderItem(&orderItem)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Delete an order item
func (h *OrderHandler) DeleteOrderItem(w http.ResponseWriter, r *http.Request) {
	orderItemID := mux.Vars(r)["order_item_id"]
	err := h.service.DeleteOrderItem(orderItemID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Get all items for an order
func (h *OrderHandler) GetOrderItems(w http.ResponseWriter, r *http.Request) {
	orderID := mux.Vars(r)["order_id"]
	items, err := h.service.GetOrderItems(orderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(items)
}
