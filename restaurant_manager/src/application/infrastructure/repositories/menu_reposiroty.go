package repositories

import (
	"github.com/jmoiron/sqlx"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type MenuRepositoryImpl struct {
	db *sqlx.DB
}

func NewMenuRepository(db *sqlx.DB) repositories.MenuRepository {
	return &MenuRepositoryImpl{db: db}
}

// CreateMenu adds a new menu
func (repo *MenuRepositoryImpl) CreateMenu(menu *models.Menu) (string, error) {
	query := `INSERT INTO servu.menus (restaurant_id, name)
	          VALUES ($1, $2) RETURNING menu_id`
	var menuID string
	err := repo.db.QueryRow(query, menu.RestaurantID, menu.Name).Scan(&menuID)
	return menuID, err
}

// DeleteMenu removes a menu
func (repo *MenuRepositoryImpl) DeleteMenu(menuID string) error {
	_, err := repo.db.Exec(`DELETE FROM servu.menus WHERE menu_id = $1`, menuID)
	return err
}

// AddMenuItem adds an item to a menu
func (repo *MenuRepositoryImpl) AddMenuItem(menuItem *models.MenuItem) (string, error) {
	query := `INSERT INTO servu.menu_items (menu_id, name, description, price, available)
	          VALUES ($1, $2, $3, $4, $5) RETURNING menu_item_id`
	var menuItemID string
	err := repo.db.QueryRow(query, menuItem.MenuID, menuItem.Name, menuItem.Description, menuItem.Price, menuItem.Available).Scan(&menuItemID)
	return menuItemID, err
}

// DeleteMenuItem removes an item from a menu
func (repo *MenuRepositoryImpl) DeleteMenuItem(menuItemID string) error {
	_, err := repo.db.Exec(`DELETE FROM servu.menu_items WHERE menu_item_id = $1`, menuItemID)
	return err
}

// UpdateMenuItem updates a menu item
func (repo *MenuRepositoryImpl) UpdateMenuItem(menuItem *models.MenuItem) error {
	query := `UPDATE servu.menu_items SET name=$1, description=$2, price=$3, available=$4 WHERE menu_item_id=$5`
	_, err := repo.db.Exec(query, menuItem.Name, menuItem.Description, menuItem.Price, menuItem.Available, menuItem.MenuItemID)
	return err
}
