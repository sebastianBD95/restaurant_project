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

func (repo *InventoryRepositoryImpl) CreateInventory(inventories []models.Inventory) ([]string, error) {
	var inventoryIDs []string
	err := repo.db.Transaction(func(tx *gorm.DB) error {
		for i := range inventories {
			result := tx.Clauses(clause.Returning{}).Omit("inventory_id").Create(&inventories[i])
			if result.Error != nil {
				return result.Error
			}
			inventoryIDs = append(inventoryIDs, inventories[i].InventoryID)
		}
		return nil
	})
	if err != nil {
		return nil, err
	}
	return inventoryIDs, nil
}

func (repo *InventoryRepositoryImpl) GetInventory(inventoryID string) (*models.Inventory, error) {
	var inventory models.Inventory
	err := repo.db.Preload("RawIngredient").First(&inventory, "inventory_id = ?", inventoryID).Error
	if err != nil {
		return nil, err
	}
	return &inventory, nil
}

func (repo *InventoryRepositoryImpl) GetInventoryByRestaurantID(restaurantID string) ([]models.Inventory, error) {
	var inventories []models.Inventory
	err := repo.db.Preload("RawIngredient").Where("restaurant_id = ?", restaurantID).Find(&inventories).Error
	return inventories, err
}

func (repo *InventoryRepositoryImpl) UpdateInventory(inventories []models.Inventory) error {
	for _, inventory := range inventories {
		err := repo.db.Model(&models.Inventory{}).
			Where("inventory_id = ?", inventory.InventoryID).
			Updates(inventory).Error
		if err != nil {
			return err
		}
	}
	return nil
}

func (repo *InventoryRepositoryImpl) DeleteInventory(inventoryID string) error {
	return repo.db.Delete(&models.Inventory{}, "inventory_id = ?", inventoryID).Error
}
