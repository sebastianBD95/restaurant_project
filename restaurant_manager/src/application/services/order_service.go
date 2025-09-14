package services

import (
	"fmt"
	"restaurant_manager/src/application/utils"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
	"strings"
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
	return service.repo.WithTransaction(func(txRepo repositories.OrderRepository) error {
		err := txRepo.UpdateOrder(order)
		if err != nil {
			return err
		}
		order, err = txRepo.GetOrder(order.OrderID)
		if err != nil {
			return err
		}
		for _, item := range order.OrderItems {
			if item.Status != models.OrderStatus("cancelled") && item.Status != models.OrderStatus("completed") {
				if order.Status == models.OrderStatus("paid") {
					item.Status = models.OrderStatus("completed")
				} else {
					item.Status = models.OrderStatus(order.Status)
				}
				err = txRepo.UpdateOrderItem(&item)
				if err != nil {
					return err
				}
			}
		}
		if order.Status == models.Paid {
			err = service.tableService.UpdateTableStatus(order.TableID, string(models.TableStatusAvailable))
			if err != nil {
				return err
			}
		}
		return nil
	})
}

func (service *OrderService) GetOrder(orderID string) (*models.Order, error) {
	return service.repo.GetOrder(orderID)
}

func (service *OrderService) GetOrderByRestaurantID(restaurantID string, status string, tableID string, startDate string, endDate string) ([]models.Order, error) {
	return service.repo.GetOrderByRestaurantID(restaurantID, status, tableID, startDate, endDate)
}

func (s *OrderService) AddOrderItem(orderItem *models.OrderItem) (string, error) {
	var orderItemID string

	err := s.repo.WithTransaction(func(txRepo repositories.OrderRepository) error {
		order, _ := s.repo.GetOrder(orderItem.OrderID)
		if order != nil {
			// Existing order: add or update order item
			itemExists := false
			for _, item := range order.OrderItems {
				if item.MenuItemID == orderItem.MenuItemID && item.Status == models.OrderStatus("pending") && strings.EqualFold(*orderItem.Observation, *item.Observation) {
					itemExists = true
					orderItem.Quantity += item.Quantity
					break
				}
			}
			if itemExists {
				return s.updateOrderItemQuantity(orderItem)
			} else {
				menuItem, err := s.menuService.GetMenuItemByID(orderItem.MenuItemID)
				if err != nil {
					return err
				}
				if strings.Contains(*orderItem.Observation, "Guarnición") {
					orderItem.Price = 0
				} else {
					orderItem.Price = menuItem.Price
				}
				orderItem.Status = models.OrderStatus("pending")
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

// updateOrderItemQuantity updates the quantity of an existing order item
func (s *OrderService) updateOrderItemQuantity(orderItem *models.OrderItem) error {
	err := s.repo.UpdateOrderItem(orderItem)
	if err != nil {
		return err
	}
	return nil
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

func (s *OrderService) UpdateOrderItem(orderID string, menuItemID string, observation string, status string) error {
	return s.repo.WithTransaction(func(txRepo repositories.OrderRepository) error {
		orderItem, err := txRepo.GetOrderItem(orderID, menuItemID, observation)
		if err != nil {
			return err
		}
		orderItem.Status = models.OrderStatus(status)
		if err := txRepo.UpdateOrderItem(orderItem); err != nil {
			return err
		}
		return nil
	})
}

func (s *OrderService) DeleteOrderItem(orderID string, menuItemID string, observation string) error {
	return s.repo.WithTransaction(func(txRepo repositories.OrderRepository) error {
		orderItem, err := txRepo.GetOrderItem(orderID, menuItemID, observation)
		if err != nil {
			return err
		}

		if orderItem.Quantity > 1 {
			orderItem.Quantity--
		} else {
			orderItem.Status = models.OrderStatus("cancelled")
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
		if item.Status != models.OrderStatus("cancelled") {
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

func (s *OrderService) CreateVoidOrderItem(orderID string, menuItemID string, restaurantID string, observation string) error {
	return s.repo.WithTransaction(func(txRepo repositories.OrderRepository) error {
		orderItem, err := txRepo.GetOrderItem(orderID, menuItemID, observation)
		if err != nil {
			return err
		}
		orderItem.Quantity = orderItem.Quantity - 1
		if orderItem.Quantity == 0 {
			err = s.DeleteOrderItem(orderID, menuItemID, observation)
			if err != nil {
				return err
			}
		} else {
			err = txRepo.UpdateOrderItem(orderItem)
			if err != nil {
				return err
			}
			err = s.inventoryService.AddInventoryForMenuItem(&orderItem.MenuItem, 1)
			if err != nil {
				return err
			}
		}
		voidOrderItem := &models.VoidOrderItem{
			RestaurantID: restaurantID,
			MenuItemID:   menuItemID,
			Quantity:     1, // Always void 1 item at a time
			Price:        orderItem.Price,
			Observation:  observation,
			VoidReason:   "void",
			Status:       models.VoidOrderItemVoided,
			CreatedAt:    utils.GetCurrentUTCTime(),
		}
		err = txRepo.AddVoidOrderItem(voidOrderItem)
		if err != nil {
			return err
		}
		return nil
	})
}

func (s *OrderService) GetVoidOrderItems(restaurantID string) ([]models.VoidOrderItem, error) {
	return s.repo.GetVoidOrderItems(restaurantID)
}

func (s *OrderService) RecoverVoidOrderItem(voidOrderItemID string, targetOrderID string) error {
	return s.repo.WithTransaction(func(txRepo repositories.OrderRepository) error {
		// Get the void order item
		voidItem, err := s.repo.GetVoidOrderItemByID(voidOrderItemID)
		if err != nil {
			return err
		}

		// Check if the void item is still available for recovery
		if voidItem.Status != models.VoidOrderItemVoided {
			return fmt.Errorf("void item is not available for recovery")
		}

		// Get the target order to check if it has a matching item
		targetOrder, err := txRepo.GetOrder(targetOrderID)
		if err != nil {
			return fmt.Errorf("target order not found")
		}

		// Find a matching order item in the target order
		var matchingOrderItem *models.OrderItem
		for i := range targetOrder.OrderItems {
			item := &targetOrder.OrderItems[i]
			if item.MenuItemID == voidItem.MenuItemID {
				matchingOrderItem = item
				break
			}
		}

		if matchingOrderItem == nil {
			return fmt.Errorf("target order does not contain a matching item for recovery")
		}

		// Update the quantity of the existing order item
		matchingOrderItem.Status = models.OrderStatus("prepared")
		err = txRepo.UpdateOrderItem(matchingOrderItem)
		if err != nil {
			return err
		}

		// Delete the void order item
		err = txRepo.DeleteVoidOrderItem(voidOrderItemID)
		if err != nil {
			return err
		}

		return nil
	})
}
