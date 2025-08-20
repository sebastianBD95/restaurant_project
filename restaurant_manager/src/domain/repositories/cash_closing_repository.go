package repositories

import (
	"restaurant_manager/src/domain/models"
	"time"
)

type CashClosingRepository interface {
	CreateCashClosing(cashClosing *models.CashClosing) error
	GetCashClosingByDate(restaurantID string, date time.Time) (*models.CashClosing, error)
	GetCashClosingHistory(restaurantID string, startDate, endDate time.Time) ([]models.CashClosing, error)
	UpdateCashClosing(cashClosing *models.CashClosing) error
	DeleteCashClosing(cashClosingID string) error
	GetCashClosingStats(restaurantID string, startDate, endDate time.Time) (*models.CashClosing, error)
}
