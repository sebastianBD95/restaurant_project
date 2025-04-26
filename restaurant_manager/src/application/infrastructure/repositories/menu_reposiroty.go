package repositories

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"

	"github.com/jmoiron/sqlx"
)

type MenuRepositoryImpl struct {
	db *sqlx.DB
}

func NewMenuRepository(db *sqlx.DB) repositories.MenuRepository {
	return &MenuRepositoryImpl{db: db}
}

// AddMenuItem adds an item to a menu
func (repo *MenuRepositoryImpl) AddMenuItem(menuItem *models.MenuItem) (string, error) {
	query := `INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, image_url,category)
	          VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING menu_item_id`
	var menuItemID string
	err := repo.db.QueryRow(query, menuItem.RestaurantID, menuItem.Name, menuItem.Description, menuItem.Price, menuItem.Available, menuItem.ImageURL, menuItem.Category).Scan(&menuItemID)
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

func (repo *MenuRepositoryImpl) GetMenuItems(restaurantID string) ([]models.MenuItem, error) {
	var menuItems []models.MenuItem
	query := `SELECT * FROM servu.menu_items WHERE restaurant_id = $1`
	err := repo.db.Select(&menuItems, query, restaurantID)
	return menuItems, err
}
