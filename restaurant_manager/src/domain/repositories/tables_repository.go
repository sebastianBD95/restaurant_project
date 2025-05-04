package repositories

import "restaurant_manager/src/domain/models"

type TableRepository interface {
	CreateTable(table *models.Table) (string, error)
	GetTable(tableID string) (*models.Table, error)
	GetTablesByRestaurantId(restaurantID string) ([]models.Table, error)
	UpdateTable(table *models.Table) error
	DeleteTable(tableID string) error
}
