package services

import (
	"fmt"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type TableService struct {
	repo       repositories.TableRepository
	QRtemplate string
}

func NewTableService(repo repositories.TableRepository, QRTemplate string) *TableService {
	return &TableService{repo: repo, QRtemplate: QRTemplate}
}

func (s *TableService) CreateTable(table *models.Table) (string, error) {
	table.QRCode = fmt.Sprintf(s.QRtemplate, table.RestaurantID, models.OrderStatus("ordered"), table.TableID)
	return s.repo.CreateTable(table)
}

func (s *TableService) GetTable(tableID string) (*models.Table, error) {
	return s.repo.GetTable(tableID)
}

func (s *TableService) UpdateTable(table *models.Table) error {
	return s.repo.UpdateTable(table)
}

func (s *TableService) DeleteTable(tableID string) error {
	return s.repo.DeleteTable(tableID)
}

func (s *TableService) GetTablesByRestaurantId(restaurantID string) ([]models.Table, error) {
	return s.repo.GetTablesByRestaurantId(restaurantID)
}

func (service *TableService) UpdateTableStatus(tableID string, status string) error {
	table := &models.Table{
		TableID: tableID,
		Status:  models.TableStatus(status),
	}
	return service.repo.UpdateTable(table)
}
