package repositories

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type TableRepositoryImpl struct {
	db *gorm.DB
}

func NewTableRepository(db *gorm.DB) repositories.TableRepository {
	return &TableRepositoryImpl{db: db}
}

func (repo *TableRepositoryImpl) CreateTable(table *models.Table) (string, error) {
	result := repo.db.Clauses(clause.Returning{}).Omit("table_id").Create(&table)
	if result.Error != nil {
		return "", result.Error
	}
	return table.TableID, nil
}

func (repo *TableRepositoryImpl) DeleteTable(tableID string) error {
	return repo.db.Delete(&models.Table{}, "table_id = ?", tableID).Error
}

func (repo *TableRepositoryImpl) UpdateTable(table *models.Table) error {
	return repo.db.Model(&models.Table{}).
		Where("table_id = ?", table.TableID).
		Updates(table).Error
}

func (repo *TableRepositoryImpl) GetTable(tableID string) (*models.Table, error) {
	var table models.Table
	err := repo.db.First(&table, "table_id = ?", tableID).Error
	if err != nil {
		return nil, err
	}
	return &table, nil
}

func (repo *TableRepositoryImpl) GetTablesByRestaurantId(restaurantID string) ([]models.Table, error) {
	var tables []models.Table
	err := repo.db.Where("restaurant_id = ?", restaurantID).Find(&tables).Error
	return tables, err
}
