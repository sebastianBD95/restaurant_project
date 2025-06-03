package repositories

import (
	"restaurant_manager/src/domain/models"
)

type OrderRepository interface {
	CreateOrder(order *models.Order) (string, error)
	DeleteOrder(orderID string) error
	UpdateOrder(order *models.Order) error
	GetOrder(orderID string) (*models.Order, error)
	GetOrderByRestaurantID(restaurantID string, status string) ([]models.Order, error)
	AddOrderItem(orderItem *models.OrderItem) (string, error)
	UpdateOrderItem(orderItem *models.OrderItem) error
	DeleteOrderItem(orderID string, menuItemID string) error
	GetOrderItems(orderID string) ([]models.OrderItem, error)
	GetOrderItem(orderID string, menuItemID string) (*models.OrderItem, error)
	WithTransaction(fn func(txRepo OrderRepository) error) error
	AddVoidOrderItem(voidOrderItem *models.VoidOrderItem) error
	GetVoidOrderItems(restaurantID string) ([]models.VoidOrderItem, error)
}
