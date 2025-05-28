package services

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type InventoryService struct {
	repo        repositories.InventoryRepository
	menuService *MenuService
}

func NewInventoryService(repo repositories.InventoryRepository, menuService *MenuService) *InventoryService {
	return &InventoryService{repo: repo, menuService: menuService}
}

func (s *InventoryService) CreateInventory(inventories []models.Inventory) ([]string, error) {
	return s.repo.CreateInventory(inventories)
}

func (s *InventoryService) GetInventory(inventoryID string) (*models.Inventory, error) {
	return s.repo.GetInventory(inventoryID)
}

func (s *InventoryService) GetInventoryByRestaurantID(restaurantID string) ([]models.Inventory, error) {
	return s.repo.GetInventoryByRestaurantID(restaurantID)
}

func (s *InventoryService) UpdateInventory(inventories []models.Inventory) error {
	return s.repo.UpdateInventory(inventories)
}

func (s *InventoryService) DeleteInventory(inventoryID string) error {
	return s.repo.DeleteInventory(inventoryID)
}

func (s *InventoryService) GetInventoryByRawIngredientIDAndRestaurantID(rawIngredientID string, restaurantID string) (*models.Inventory, error) {
	return s.repo.GetInventoryByRawIngredientIDAndRestaurantID(rawIngredientID, restaurantID)
}

func (s *InventoryService) DeductInventoryForMenuItem(menuItem *models.MenuItem, quantity int) (bool, error) {
	inventories := []models.Inventory{}
	zeroInventory := false
	for _, item := range menuItem.Ingredients {
		inventory, err := s.GetInventoryByRawIngredientIDAndRestaurantID(item.RawIngredientID, menuItem.RestaurantID)
		if err != nil {
			return false, err
		}
		amountToDeduct := item.Amount * float64(quantity)
		inventory.Quantity -= amountToDeduct
		if inventory.Quantity < 0 {
			inventory.Quantity = 0
		}
		if inventory.Quantity == 0 {
			zeroInventory = true
		}
		inventories = append(inventories, *inventory)
	}
	err := s.UpdateInventory(inventories)
	if err != nil {
		return false, err
	}
	return zeroInventory, nil
}

func (s *InventoryService) AddInventoryForMenuItem(menuItem *models.MenuItem, quantity int) error {
	inventories := []models.Inventory{}
	for _, item := range menuItem.Ingredients {
		inventory, err := s.GetInventoryByRawIngredientIDAndRestaurantID(item.RawIngredientID, menuItem.RestaurantID)
		if err != nil {
			return err
		}
		amountToAdd := item.Amount * float64(quantity)
		inventory.Quantity += amountToAdd
		inventories = append(inventories, *inventory)
	}
	return s.UpdateInventory(inventories)
}
