package services

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type MenuService struct {
	repo repositories.MenuRepository
}

func NewMenuService(repo repositories.MenuRepository) *MenuService {
	return &MenuService{repo: repo}
}

func (s *MenuService) CreateMenu(menu *models.Menu) (string, error) {
	return s.repo.CreateMenu(menu)
}

func (s *MenuService) DeleteMenu(menuID string) error {
	return s.repo.DeleteMenu(menuID)
}

func (s *MenuService) AddMenuItem(menuItem *models.MenuItem) (string, error) {
	return s.repo.AddMenuItem(menuItem)
}

func (s *MenuService) DeleteMenuItem(menuItemID string) error {
	return s.repo.DeleteMenuItem(menuItemID)
}

func (s *MenuService) UpdateMenuItem(menuItem *models.MenuItem) error {
	return s.repo.UpdateMenuItem(menuItem)
}
