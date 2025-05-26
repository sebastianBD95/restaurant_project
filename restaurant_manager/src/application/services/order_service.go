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

func (service *OrderService) GetOrderByRestaurantID(restaurantID string, status string) ([]models.Order, error) {
	return service.repo.GetOrderByRestaurantID(restaurantID, status)
}

func (s *OrderService) AddOrderItem(orderItem *models.OrderItem) (string, error) {
	var orderItemID string

	err := s.repo.WithTransaction(func(txRepo repositories.OrderRepository) error {
		order, err := s.repo.GetOrder(orderItem.OrderID)
		if order != nil {
			// Existing order: add or update order item
			itemExists := false
			for _, item := range order.OrderItems {
				if item.MenuItemID == orderItem.MenuItemID && item.Status == models.OrderItemStatus("pending") {
					itemExists = true
					orderItem.Quantity += item.Quantity
					break
				}
			}
			if itemExists {
				err = s.repo.UpdateOrderItem(orderItem)
				if err != nil {
					return err
				}
			} else {
				menuItem, err := s.menuService.GetMenuItemByID(orderItem.MenuItemID)
				if err != nil {
					return err
				}
				orderItem.Price = menuItem.Price
				orderItem.Status = models.OrderItemStatus("pending")
				id, err := s.repo.AddOrderItem(orderItem)
				if err != nil {
					return err
				}
				orderItemID = id
			}
			return s.handleInventoryAndMenu(orderItem.MenuItemID, orderItem.Quantity)
		} else {
			// New order: add order item (assume order is being created elsewhere)

			id, err := s.repo.AddOrderItem(orderItem)
			if err != nil {
				return err
			}
			orderItemID = id
			return s.handleInventoryAndMenu(orderItem.MenuItemID, orderItem.Quantity)
		}
	})
	if err != nil {
		return "", err
	}

	return orderItemID, nil
}

func (s *OrderService) handleInventoryAndMenu(menuItemID string, quantity int) error {
	menuItem, err := s.menuService.GetMenuItemByID(menuItemID)
	if err != nil {
		return err
	}
	zeroInventory, err := s.inventoryService.DeductInventoryForMenuItem(menuItem, quantity)
	if err != nil {
		return err
	}
	shouldReturn, err1 := zeroInventoryCheck(zeroInventory, menuItem, err, s)
	if shouldReturn {
		return err1
	}
	return nil
}

func zeroInventoryCheck(zeroInventory bool, menuItem *models.MenuItem, err error, s *OrderService) (bool, error) {
	if zeroInventory {
		menuItem.Available = false
		err = s.menuService.UpdateMenuItem(menuItem)
		if err != nil {
			return true, err
		}
	}
	return false, nil
}

func (s *OrderService) UpdateOrderItem(orderItem *models.OrderItem) error {
	return s.repo.UpdateOrderItem(orderItem)
}

func (s *OrderService) DeleteOrderItem(orderID string, menuItemID string) error {
	return s.repo.WithTransaction(func(txRepo repositories.OrderRepository) error {
		orderItem, err := txRepo.GetOrderItem(orderID, menuItemID)
		if err != nil {
			return err
		}

		if orderItem.Quantity > 1 {
			orderItem.Quantity--
		} else {
			orderItem.Status = models.OrderItemStatus("cancelled")
		}

		if err := txRepo.UpdateOrderItem(orderItem); err != nil {
			return err
		}

		menuItem, err := s.menuService.GetMenuItemByID(orderItem.MenuItemID)
		if err != nil {
			return err
		}
		if err := s.inventoryService.AddInventoryForMenuItem(menuItem, orderItem.Quantity); err != nil {
			return err
		}

		order, err := txRepo.GetOrder(orderID)
		if err != nil {
			return err
		}
		shouldReturn, err := CancelOrder(order, txRepo, s)
		if shouldReturn {
			return err
		}
		return nil
	})
}

func CancelOrder(order *models.Order, txRepo repositories.OrderRepository, s *OrderService) (bool, error) {
	orderCancelled := true
	for _, item := range order.OrderItems {
		if item.Status != models.OrderItemStatus("cancelled") {
			orderCancelled = false
			break
		}
	}
	if orderCancelled {
		order.Status = models.OrderStatus("cancelled")
		if err := txRepo.UpdateOrder(order); err != nil {
			return true, err
		}
		if err := s.tableService.UpdateTableStatus(order.TableID, string(models.TableStatusAvailable)); err != nil {
			return true, err
		}
	}
	return false, nil
}

func (s *OrderService) GetOrderItems(orderID string) ([]models.OrderItem, error) {
	return s.repo.GetOrderItems(orderID)
}
