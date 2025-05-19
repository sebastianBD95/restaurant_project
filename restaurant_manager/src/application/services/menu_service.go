package services

import (
	"mime/multipart"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/ports"
	"restaurant_manager/src/domain/repositories"
)

type MenuService struct {
	repo              repositories.MenuRepository
	imageManager      ports.StorageImageManager
	ingredientService *IngredientsService
}

func NewMenuService(repo repositories.MenuRepository, awsS3 ports.StorageImageManager, ingredientService *IngredientsService) *MenuService {
	return &MenuService{repo: repo, imageManager: awsS3, ingredientService: ingredientService}
}

func (s *MenuService) AddMenuItem(menuItem *models.MenuItem) (string, error) {
	menuItemID, err := s.repo.AddMenuItem(menuItem)
	if err != nil {
		return "", err
	}
	for i := range menuItem.Ingredients {
		menuItem.Ingredients[i].MenuItemID = menuItemID
	}
	_, err = s.ingredientService.CreateIngredients(menuItem.Ingredients)
	if err != nil {
		return "", err
	}

	return menuItemID, nil
}

func (s *MenuService) DeleteMenuItem(menuItemID string) error {
	return s.repo.DeleteMenuItem(menuItemID)
}

func (s *MenuService) UpdateMenuItem(menuItem *models.MenuItem) error {
	return s.repo.UpdateMenuItem(menuItem)
}

func (s *MenuService) GetMenuItemsByRestaurantID(restaurantID string) ([]models.MenuItem, error) {
	return s.repo.GetMenuItemsByRestaurantID(restaurantID)
}
func (s *MenuService) GetMenuItemByID(menuItemID string) (*models.MenuItem, error) {
	return s.repo.GetMenuItemByID(menuItemID)
}

func (s *MenuService) UploadFile(owner string, file multipart.File) (string, error) {

	return s.imageManager.UploadImage(owner, "menu", "servu-web", file)
}
