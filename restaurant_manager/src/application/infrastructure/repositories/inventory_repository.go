package repositories

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type InventoryRepositoryImpl struct {
	db *gorm.DB
}

func NewInventoryRepository(db *gorm.DB) repositories.InventoryRepository {
	return &InventoryRepositoryImpl{db}
}

func (repo *InventoryRepositoryImpl) CreateInventory(inventory *models.Inventory) (string, error) {
	result := repo.db.Clauses(clause.Returning{}).Omit("inventory_id").Create(&inventory)
	if result.Error != nil {
		return "", result.Error
	}
	return inventory.InventoryID, nil
}

func (repo *InventoryRepositoryImpl) GetInventory(inventoryID string) (*models.Inventory, error) {
	var inventory models.Inventory
	err := repo.db.Preload("Ingredient").First(&inventory, "inventory_id = ?", inventoryID).Error
	if err != nil {
		return nil, err
	}
	return &inventory, nil
}

func (repo *InventoryRepositoryImpl) GetInventoryByRestaurantID(restaurantID string) ([]models.Inventory, error) {
	var inventories []models.Inventory
	err := repo.db.Preload("Ingredient").Where("restaurant_id = ?", restaurantID).Find(&inventories).Error
	return inventories, err
}

func (repo *InventoryRepositoryImpl) UpdateInventory(inventory *models.Inventory) error {
	return repo.db.Model(&models.Inventory{}).
		Where("inventory_id = ?", inventory.InventoryID).
		Updates(inventory).Error
}

func (repo *InventoryRepositoryImpl) DeleteInventory(inventoryID string) error {
	return repo.db.Delete(&models.Inventory{}, "inventory_id = ?", inventoryID).Error
}
