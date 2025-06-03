package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/interfaces/handlers/dto"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/domain/models"

	"github.com/gorilla/mux"
)

type OrderHandler struct {
	service *services.OrderService
}

func NewOrderHandler(service *services.OrderService) *OrderHandler {
	return &OrderHandler{service}
}

func (h *OrderHandler) CreateOrder(w http.ResponseWriter, r *http.Request) {
	var orderDto *dto.OrderDTO
	json.NewDecoder(r.Body).Decode(&orderDto)
	order := models.Order{
		TableID:      orderDto.TableID,
		RestaurantID: orderDto.RestaurantID,
		Status:       models.OrderStatus(orderDto.Status),
		TotalPrice:   orderDto.TotalPrice,
	}
	orderID, err := h.service.CreateOrder(&order)
	for _, item := range orderDto.Items {
		orderItem := models.OrderItem{
			OrderID:     orderID,
			MenuItemID:  item.MenuItemID,
			Quantity:    item.Quantity,
			Status:      "pending",
			Price:       item.Price,
			Observation: &item.Observation,
		}
		_, err := h.service.AddOrderItem(&orderItem)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
	}
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(map[string]string{"order_id": orderID})
}

func (h *OrderHandler) DeleteOrder(w http.ResponseWriter, r *http.Request) {
	var orderID string
	vars := mux.Vars(r)
	orderID = vars["orders_id"]
	err := h.service.DeleteOrder(orderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *OrderHandler) UpdateOrder(w http.ResponseWriter, r *http.Request) {
	var orderDto *dto.OrderDTO
	json.NewDecoder(r.Body).Decode(&orderDto)
	order := models.Order{
		OrderID:      orderDto.OrderID,
		TableID:      orderDto.TableID,
		RestaurantID: orderDto.RestaurantID,
		Status:       models.OrderStatus(orderDto.Status),
		TotalPrice:   orderDto.TotalPrice,
	}
	err := h.service.UpdateOrder(&order)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)

}

func (h *OrderHandler) GetOrder(w http.ResponseWriter, r *http.Request) {
	var orderID string
	vars := mux.Vars(r)
	orderID = vars["orders_id"]
	order, err := h.service.GetOrder(orderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	json.NewEncoder(w).Encode(order)
}

func (h *OrderHandler) GetOrderByRestaurantID(w http.ResponseWriter, r *http.Request) {
	queryParams := r.URL.Query()
	restaurantID := queryParams.Get("restaurant_id")
	status := queryParams.Get("status")
	orders, err := h.service.GetOrderByRestaurantID(restaurantID, status)
	if err != nil {
		http.Error(w, err.Error(), http.StatusNotFound)
		return
	}
	orderDTOs := dto.FromOrders(orders)
	json.NewEncoder(w).Encode(orderDTOs)
}

func (h *OrderHandler) AddOrderItem(w http.ResponseWriter, r *http.Request) {
	var orderItemsID []string
	orderID := mux.Vars(r)["order_id"]
	var orderItem []dto.OrderItemDTO
	json.NewDecoder(r.Body).Decode(&orderItem)
	for _, item := range orderItem {
		orderItemModel := models.OrderItem{
			OrderID:    orderID,
			MenuItemID: item.MenuItemID,
			Quantity:   item.Quantity,
		}
		orderItemID, err := h.service.AddOrderItem(&orderItemModel)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}
		orderItemsID = append(orderItemsID, orderItemID)
	}
	json.NewEncoder(w).Encode(orderItemsID)
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
	orderID := mux.Vars(r)["order_id"]
	menuItemID := mux.Vars(r)["menu_item_id"]
	err := h.service.DeleteOrderItem(orderID, menuItemID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

// Get all items for an order
func (h *OrderHandler) GetOrderItems(w http.ResponseWriter, r *http.Request) {
	orderID := mux.Vars(r)["orders_id"]
	items, err := h.service.GetOrderItems(orderID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	json.NewEncoder(w).Encode(items)
}

func (h *OrderHandler) CreateVoidOrderItem(w http.ResponseWriter, r *http.Request) {
	orderID := mux.Vars(r)["order_id"]
	menuItemID := mux.Vars(r)["menu_item_id"]

	var body struct {
		RestaurantID string `json:"restaurantId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	err := h.service.CreateVoidOrderItem(orderID, menuItemID, body.RestaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *OrderHandler) GetVoidOrderItems(w http.ResponseWriter, r *http.Request) {
	restaurantID := mux.Vars(r)["restaurant_id"]
	items, err := h.service.GetVoidOrderItems(restaurantID)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	orderItemDTOs := dto.FromVoidOrderItems(items)
	json.NewEncoder(w).Encode(orderItemDTOs)
}
