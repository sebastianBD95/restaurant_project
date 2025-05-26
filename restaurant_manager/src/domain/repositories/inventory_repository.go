package repositories

import "restaurant_manager/src/domain/models"

type InventoryRepository interface {
	CreateInventory(inventories []models.Inventory) ([]string, error)
	GetInventory(inventoryID string) (*models.Inventory, error)
	GetInventoryByRestaurantID(restaurantID string) ([]models.Inventory, error)
	UpdateInventory(inventory []models.Inventory) error
	DeleteInventory(inventoryID string) error
	GetInventoryByRawIngredientIDAndRestaurantID(rawIngredientID string, restaurantID string) (*models.Inventory, error)
}
