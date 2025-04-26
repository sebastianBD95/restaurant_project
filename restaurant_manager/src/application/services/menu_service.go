package services

import (
	"mime/multipart"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/ports"
	"restaurant_manager/src/domain/repositories"
)

type MenuService struct {
	repo         repositories.MenuRepository
	imageManager ports.StorageImageManager
}

func NewMenuService(repo repositories.MenuRepository, awsS3 ports.StorageImageManager) *MenuService {
	return &MenuService{repo: repo, imageManager: awsS3}
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

func (s *MenuService) GetMenuItems(menuID string) ([]models.MenuItem, error) {
	return s.repo.GetMenuItems(menuID)
}

func (s *MenuService) UploadFile(owner string, file multipart.File) (string, error) {

	return s.imageManager.UploadImage(owner, "menu", "servu-web", file)
}
