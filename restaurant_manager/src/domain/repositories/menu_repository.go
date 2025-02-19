package repositories

import (
	"restaurant_manager/src/domain/models"
)

type MenuRepository interface {
	CreateMenu(menu *models.Menu) (string, error)
	DeleteMenu(menuID string) error
	AddMenuItem(menuItem *models.MenuItem) (string, error)
	DeleteMenuItem(menuItemID string) error
	UpdateMenuItem(menuItem *models.MenuItem) error
}
