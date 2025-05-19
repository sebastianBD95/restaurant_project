package repositories

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type MenuRepositoryImpl struct {
	db *gorm.DB
}

func NewMenuRepository(db *gorm.DB) repositories.MenuRepository {
	return &MenuRepositoryImpl{db}
}

func (repo *MenuRepositoryImpl) AddMenuItem(menuItem *models.MenuItem) (string, error) {
	result := repo.db.Clauses(clause.Returning{}).Omit("menu_item_id", "Ingredients").Create(&menuItem)
	if result.Error != nil {
		return "", result.Error
	}
	return menuItem.MenuItemID, nil
}

func (repo *MenuRepositoryImpl) DeleteMenuItem(menuItemID string) error {
	return repo.db.Delete(&models.MenuItem{}, "menu_item_id = ?", menuItemID).Error
}

func (repo *MenuRepositoryImpl) UpdateMenuItem(menuItem *models.MenuItem) error {
	return repo.db.Model(&models.MenuItem{}).
		Where("menu_item_id = ?", menuItem.MenuItemID).
		Updates(menuItem).Error
}

func (repo *MenuRepositoryImpl) GetMenuItemsByRestaurantID(restaurantID string) ([]models.MenuItem, error) {
	var items []models.MenuItem
	err := repo.db.Preload("Ingredients").Preload("Ingredients.RawIngredient").Where("restaurant_id = ?", restaurantID).Find(&items).Error
	return items, err
}

func (repo *MenuRepositoryImpl) GetMenuItemByID(menuItemID string) (*models.MenuItem, error) {
	var item models.MenuItem
	err := repo.db.Preload("Ingredients").Preload("Ingredients.RawIngredient").Where("menu_item_id = ?", menuItemID).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}
