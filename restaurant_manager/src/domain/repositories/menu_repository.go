package repositories

import (
	"restaurant_manager/src/domain/models"
)

type MenuRepository interface {
	AddMenuItem(menuItem *models.MenuItem) (string, error)
	DeleteMenuItem(menuItemID string) error
	UpdateMenuItem(menuItem *models.MenuItem) error
	GetMenuItemsByRestaurantID(restaurantID string) ([]models.MenuItem, error)
	GetMenuItemByID(menuItemID string) (*models.MenuItem, error)
}
