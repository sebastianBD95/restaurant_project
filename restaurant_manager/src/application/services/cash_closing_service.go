package services

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
	"time"

	"github.com/google/uuid"
)

type CashClosingService struct {
	cashClosingRepo repositories.CashClosingRepository
	orderRepo       repositories.OrderRepository
	menuRepo        repositories.MenuRepository
}

func NewCashClosingService(
	cashClosingRepo repositories.CashClosingRepository,
	orderRepo repositories.OrderRepository,
	menuRepo repositories.MenuRepository,
) *CashClosingService {
	return &CashClosingService{
		cashClosingRepo: cashClosingRepo,
		orderRepo:       orderRepo,
		menuRepo:        menuRepo,
	}
}

func (s *CashClosingService) CreateCashClosing(cashClosing *models.CashClosing) error {
	// Generate UUID if not provided
	if cashClosing.CashClosingID == "" {
		cashClosing.CashClosingID = uuid.New().String()
	}

	// Set timestamps
	now := time.Now()
	cashClosing.CreatedAt = now
	cashClosing.UpdatedAt = now

	return s.cashClosingRepo.CreateCashClosing(cashClosing)
}

func (s *CashClosingService) GetCashClosingByDate(restaurantID string, date time.Time) (*models.CashClosing, error) {
	return s.cashClosingRepo.GetCashClosingByDate(restaurantID, date)
}

func (s *CashClosingService) GetCashClosingHistory(restaurantID string, startDate, endDate time.Time) ([]models.CashClosing, error) {
	return s.cashClosingRepo.GetCashClosingHistory(restaurantID, startDate, endDate)
}

func (s *CashClosingService) UpdateCashClosing(cashClosing *models.CashClosing) error {
	cashClosing.UpdatedAt = time.Now()
	return s.cashClosingRepo.UpdateCashClosing(cashClosing)
}

func (s *CashClosingService) DeleteCashClosing(cashClosingID string) error {
	return s.cashClosingRepo.DeleteCashClosing(cashClosingID)
}

func (s *CashClosingService) GetCashClosingStats(restaurantID string, startDate, endDate time.Time) (*models.CashClosing, error) {
	return s.cashClosingRepo.GetCashClosingStats(restaurantID, startDate, endDate)
}

// CalculateCashClosingData calculates the financial data for a specific date
func (s *CashClosingService) CalculateCashClosingData(restaurantID string, date time.Time) (*models.CashClosing, error) {
	// Get paid orders for the date
	orders, err := s.orderRepo.GetOrderByRestaurantID(restaurantID, "paid")
	if err != nil {
		return nil, err
	}

	// Filter orders by date
	var filteredOrders []models.Order
	for _, order := range orders {
		if order.CreatedAt.Year() == date.Year() &&
			order.CreatedAt.Month() == date.Month() &&
			order.CreatedAt.Day() == date.Day() {
			filteredOrders = append(filteredOrders, order)
		}
	}

	// Calculate totals
	var totalSales, totalRevenue, totalCosts float64
	var orderCount int

	for _, order := range filteredOrders {
		totalSales += order.TotalPrice
		totalRevenue += order.TotalPrice
		orderCount++

		// Calculate costs for this order
		orderCosts, err := s.calculateOrderCosts(order)
		if err != nil {
			return nil, err
		}
		totalCosts += orderCosts
	}

	totalProfit := totalRevenue - totalCosts
	averageOrderValue := 0.0
	if orderCount > 0 {
		averageOrderValue = totalSales / float64(orderCount)
	}

	return &models.CashClosing{
		RestaurantID:      restaurantID,
		ClosingDate:       date,
		TotalSales:        totalSales,
		TotalRevenue:      totalRevenue,
		TotalCosts:        totalCosts,
		TotalProfit:       totalProfit,
		OrderCount:        orderCount,
		AverageOrderValue: averageOrderValue,
	}, nil
}

// calculateOrderCosts calculates the total cost of ingredients for an order
func (s *CashClosingService) calculateOrderCosts(order models.Order) (float64, error) {
	var totalCosts float64

	for _, orderItem := range order.OrderItems {
		// Get menu item with ingredients
		menuItem, err := s.menuRepo.GetMenuItemByID(orderItem.MenuItemID)
		if err != nil {
			continue // Skip if menu item not found
		}

		// Calculate cost for this item
		itemCost := 0.0
		for _, ingredient := range menuItem.Ingredients {
			itemCost += ingredient.Price // Price already includes the amount
		}

		// Multiply by quantity
		totalCosts += itemCost * float64(orderItem.Quantity)
	}

	return totalCosts, nil
}
