package services

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type TableService struct {
	repo repositories.TableRepository
}

func NewTableService(repo repositories.TableRepository) *TableService {
	return &TableService{repo: repo}
}

func (s *TableService) CreateTable(table *models.Table) (string, error) {
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
