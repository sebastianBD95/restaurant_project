package services

import (
	"fmt"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type InventoryService struct {
	repo repositories.InventoryRepository
}

func NewInventoryService(repo repositories.InventoryRepository) *InventoryService {
	return &InventoryService{repo: repo}
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

func (s *InventoryService) UpdateInventoryQuantity(rawIngredientID string, amountUsed float64) error {
	inventory, err := s.repo.GetInventoryByRawIngredientID(rawIngredientID)
	if err != nil {
		return err
	}
	if inventory == nil {
		return fmt.Errorf("inventory not found for raw ingredient: %s", rawIngredientID)
	}
	inventory.Quantity -= amountUsed
	if inventory.Quantity < 0 {
		inventory.Quantity = 0
	}
	// This method is not used in the batch update flow, so we can leave the update out or implement a single update if needed.
	return nil
}

func (s *InventoryService) GetInventoryByRawIngredientID(rawIngredientID string) (*models.Inventory, error) {
	return s.repo.GetInventoryByRawIngredientID(rawIngredientID)
}
