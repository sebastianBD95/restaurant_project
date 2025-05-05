package repositories

import (
	"restaurant_manager/src/domain/models"
)

type OrderRepository interface {
	CreateOrder(order *models.Order) (string, error)
	DeleteOrder(orderID string) error
	UpdateOrder(order *models.Order) error
	GetOrder(orderID string) (*models.Order, error)
	GetOrderByRestaurantID(restaurantID string) ([]models.Order, error)
	AddOrderItem(orderItem *models.OrderItem) (string, error)
	UpdateOrderItem(orderItem *models.OrderItem) error
	DeleteOrderItem(orderItemID string) error
	GetOrderItems(orderID string) ([]models.OrderItem, error)
}
