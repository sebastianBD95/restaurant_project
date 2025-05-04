package repositories

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"

	"github.com/jmoiron/sqlx"
)

type TableRepositoryImpl struct {
	db *sqlx.DB
}

func NewTableRepository(db *sqlx.DB) repositories.TableRepository {
	return &TableRepositoryImpl{db: db}
}

// Create a new table
func (repo *TableRepositoryImpl) CreateTable(table *models.Table) (string, error) {
	query := `INSERT INTO servu.restaurant_tables (restaurant_id, table_number, qr_code)
	          VALUES ( $1, $2, $3) RETURNING table_id`
	var tableID string
	err := repo.db.QueryRow(query, table.RestaurantID, table.TableNumber, table.QRCode).Scan(&tableID)
	return tableID, err
}

// Get a table by ID
func (repo *TableRepositoryImpl) GetTable(tableID string) (*models.Table, error) {
	var table models.Table
	query := `SELECT * FROM servu.restaurant_tables WHERE table_id = $1`
	err := repo.db.Get(&table, query, tableID)
	if err != nil {
		return nil, err
	}
	return &table, nil
}

// Get tables by restaurant ID
func (repo *TableRepositoryImpl) GetTablesByRestaurantId(restaurantID string) ([]models.Table, error) {
	var tables []models.Table
	query := `SELECT * FROM servu.restaurant_tables WHERE restaurant_id = $1`
	err := repo.db.Select(&tables, query, restaurantID)
	if err != nil {
		return nil, err
	}
	return tables, nil
}

// Update table details
func (repo *TableRepositoryImpl) UpdateTable(table *models.Table) error {
	query := `UPDATE servu.restaurant_tables SET table_number=$1, qr_code=$2 WHERE table_id=$3`
	_, err := repo.db.Exec(query, table.TableNumber, table.QRCode, table.TableID)
	return err
}

// Delete a table
func (repo *TableRepositoryImpl) DeleteTable(tableID string) error {
	_, err := repo.db.Exec(`DELETE FROM servu.restaurant_tables WHERE table_id = $1`, tableID)
	return err
}
