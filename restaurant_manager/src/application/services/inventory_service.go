package services

import (
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

func (s *InventoryService) UpdateInventory(inventory []models.Inventory) error {
	return s.repo.UpdateInventory(inventory)
}

func (s *InventoryService) DeleteInventory(inventoryID string) error {
	return s.repo.DeleteInventory(inventoryID)
}
