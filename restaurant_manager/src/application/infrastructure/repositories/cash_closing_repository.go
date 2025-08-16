package repositories

import (
	"log"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
	"time"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type CashClosingRepositoryImpl struct {
	db *gorm.DB
}

func NewCashClosingRepository(db *gorm.DB) repositories.CashClosingRepository {
	return &CashClosingRepositoryImpl{db: db}
}

func (r *CashClosingRepositoryImpl) CreateCashClosing(cashClosing *models.CashClosing) error {
	log.Printf("Creating cash closing for restaurant %s on date %s", cashClosing.RestaurantID, cashClosing.ClosingDate.Format("2006-01-02"))

	result := r.db.Clauses(clause.Returning{}).Omit("cash_closing_id").Create(cashClosing)
	if result.Error != nil {
		log.Printf("Error creating cash closing: %v", result.Error)
		return result.Error
	}

	log.Printf("Successfully created cash closing with ID: %s", cashClosing.CashClosingID)
	return nil
}

func (r *CashClosingRepositoryImpl) GetCashClosingByDate(restaurantID string, date time.Time) (*models.CashClosing, error) {
	var cashClosing models.CashClosing
	err := r.db.Where("restaurant_id = ? AND closing_date = ?", restaurantID, date).First(&cashClosing).Error
	if err != nil {
		return nil, err
	}
	return &cashClosing, nil
}

func (r *CashClosingRepositoryImpl) GetCashClosingHistory(restaurantID string, startDate, endDate time.Time) ([]models.CashClosing, error) {
	var cashClosings []models.CashClosing
	err := r.db.Where("restaurant_id = ? AND closing_date BETWEEN ? AND ?", restaurantID, startDate, endDate).
		Order("closing_date DESC").
		Find(&cashClosings).Error
	return cashClosings, err
}

func (r *CashClosingRepositoryImpl) UpdateCashClosing(cashClosing *models.CashClosing) error {
	return r.db.Save(cashClosing).Error
}

func (r *CashClosingRepositoryImpl) DeleteCashClosing(cashClosingID string) error {
	return r.db.Where("cash_closing_id = ?", cashClosingID).Delete(&models.CashClosing{}).Error
}

func (r *CashClosingRepositoryImpl) GetCashClosingStats(restaurantID string, startDate, endDate time.Time) (*models.CashClosing, error) {
	var result struct {
		TotalSales        float64   `gorm:"column:total_sales"`
		TotalRevenue      float64   `gorm:"column:total_revenue"`
		TotalCosts        float64   `gorm:"column:total_costs"`
		TotalProfit       float64   `gorm:"column:total_profit"`
		OrderCount        int       `gorm:"column:order_count"`
		AverageOrderValue float64   `gorm:"column:average_order_value"`
		CreatedAt         time.Time `gorm:"column:created_at"`
		UpdatedAt         time.Time `gorm:"column:updated_at"`
	}

	err := r.db.Model(&models.CashClosing{}).
		Select(`
			SUM(total_sales) as total_sales,
			SUM(total_revenue) as total_revenue,
			SUM(total_costs) as total_costs,
			SUM(total_profit) as total_profit,
			SUM(order_count) as order_count,
			CASE WHEN SUM(order_count) > 0 THEN SUM(total_sales) / SUM(order_count) ELSE 0 END as average_order_value,
			MIN(created_at) as created_at,
			MAX(updated_at) as updated_at
		`).
		Where("restaurant_id = ? AND closing_date BETWEEN ? AND ?", restaurantID, startDate, endDate).
		Scan(&result).Error

	if err != nil {
		return nil, err
	}

	return &models.CashClosing{
		CashClosingID:     "stats",
		RestaurantID:      restaurantID,
		ClosingDate:       startDate,
		CashInRegister:    0,
		CashWithdrawn:     0,
		Notes:             "Summary",
		TotalSales:        result.TotalSales,
		TotalRevenue:      result.TotalRevenue,
		TotalCosts:        result.TotalCosts,
		TotalProfit:       result.TotalProfit,
		OrderCount:        result.OrderCount,
		AverageOrderValue: result.AverageOrderValue,
		CreatedAt:         result.CreatedAt,
		UpdatedAt:         result.UpdatedAt,
	}, nil
}
