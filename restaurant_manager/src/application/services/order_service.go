package services

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type OrderService struct {
	repo         repositories.OrderRepository
	tableService *TableService
}

func NewOrderService(repo repositories.OrderRepository, tableService *TableService) *OrderService {
	return &OrderService{repo, tableService}
}

func (service *OrderService) CreateOrder(order *models.Order) (string, error) {
	table := models.Table{
		TableID: order.TableID,
		Status:  models.TableStatus(order.Table.Status),
	}
	err := service.tableService.UpdateTable(&table)
	if err != nil {
		return "", err
	}
	orderId, err := service.repo.CreateOrder(order)
	if err != nil {
		return "", err
	}
	return orderId, nil
}

func (service *OrderService) DeleteOrder(orderID string) error {
	return service.repo.DeleteOrder(orderID)
}
func (service *OrderService) UpdateOrder(order *models.Order) error {
	return service.repo.UpdateOrder(order)
}

func (service *OrderService) GetOrder(orderID string) (*models.Order, error) {
	return service.repo.GetOrder(orderID)
}

func (service *OrderService) GetOrderByRestaurantID(restaurantID string) ([]models.Order, error) {
	return service.repo.GetOrderByRestaurantID(restaurantID)
}

func (s *OrderService) AddOrderItem(orderItem *models.OrderItem) (string, error) {
	return s.repo.AddOrderItem(orderItem)
}

func (s *OrderService) UpdateOrderItem(orderItem *models.OrderItem) error {
	return s.repo.UpdateOrderItem(orderItem)
}

func (s *OrderService) DeleteOrderItem(orderItemID string) error {
	return s.repo.DeleteOrderItem(orderItemID)
}

func (s *OrderService) GetOrderItems(orderID string) ([]models.OrderItem, error) {
	return s.repo.GetOrderItems(orderID)
}
