package services

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type OrderService struct {
	repo             repositories.OrderRepository
	tableService     *TableService
	menuService      *MenuService
	inventoryService *InventoryService
}

func NewOrderService(repo repositories.OrderRepository, tableService *TableService, menuService *MenuService, inventoryService *InventoryService) *OrderService {
	return &OrderService{repo, tableService, menuService, inventoryService}
}

func (service *OrderService) CreateOrder(order *models.Order) (string, error) {
	orderId, err := service.repo.CreateOrder(order)
	if err != nil {
		return "", err
	}
	err = service.tableService.UpdateTableStatus(order.TableID, "occupied")
	if err != nil {
		_ = service.repo.DeleteOrder(orderId)
		return "", err
	}

	return orderId, nil
}

func (service *OrderService) DeleteOrder(orderID string) error {
	return service.repo.DeleteOrder(orderID)
}

func (service *OrderService) UpdateOrder(order *models.Order) error {
	err := service.repo.UpdateOrder(order)
	if err != nil {
		return err
	}
	order, err = service.repo.GetOrder(order.OrderID)
	if err != nil {
		return err
	}
	if order.Status == models.Paid {
		err = service.tableService.UpdateTableStatus(order.TableID, string(models.TableStatusAvailable))
		if err != nil {
			return err
		}
	}

	return nil
}

func (service *OrderService) GetOrder(orderID string) (*models.Order, error) {
	return service.repo.GetOrder(orderID)
}

func (service *OrderService) GetOrderByRestaurantID(restaurantID string) ([]models.Order, error) {
	return service.repo.GetOrderByRestaurantID(restaurantID)
}

func (s *OrderService) AddOrderItem(orderItem *models.OrderItem) (string, error) {
	var orderItemID string
	err := s.repo.WithTransaction(func(txRepo repositories.OrderRepository) error {
		id, err := s.repo.AddOrderItem(orderItem)
		if err != nil {
			return err
		}
		orderItemID = id
		menuItem, err := s.menuService.GetMenuItemByID(orderItem.MenuItemID)
		if err != nil {
			return err
		}
		inventories := []models.Inventory{}
		zeroInventory := false
		for _, item := range menuItem.Ingredients {
			inventory, err := s.inventoryService.GetInventoryByRawIngredientID(item.RawIngredientID)
			if err != nil {
				return err
			}
			inventory.Quantity -= item.Amount
			if inventory.Quantity < 0 {
				inventory.Quantity = 0
			}
			if inventory.Quantity == 0 {
				zeroInventory = true
			}
			inventories = append(inventories, *inventory)
		}
		err = s.inventoryService.UpdateInventory(inventories)
		if err != nil {
			return err
		}
		if zeroInventory {
			menuItem.Available = false
			err = s.menuService.UpdateMenuItem(menuItem)
			if err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return "", err
	}

	return orderItemID, nil
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
