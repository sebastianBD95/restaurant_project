package repositories

import (
	"restaurant_manager/src/domain/models"
)

type MenuRepository interface {
	AddMenuItem(menuItem *models.MenuItem) (string, error)
	DeleteMenuItem(menuItemID string) error
	UpdateMenuItem(menuItem *models.MenuItem) error
	GetMenuItems(menuID string) ([]models.MenuItem, error)
}
