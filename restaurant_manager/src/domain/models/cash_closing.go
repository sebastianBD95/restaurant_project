package models

import (
	"time"
)

type CashClosing struct {
	CashClosingID     string    `json:"cash_closing_id" gorm:"primaryKey;column:cash_closing_id;type:uuid;default:uuid_generate_v4()"`
	RestaurantID      string    `json:"restaurant_id" gorm:"column:restaurant_id;type:uuid;not null"`
	ClosingDate       time.Time `json:"closing_date" gorm:"column:closing_date;type:date;not null"`
	CashInRegister    float64   `json:"cash_in_register" gorm:"column:cash_in_register;type:decimal(10,2);not null;default:0"`
	CashWithdrawn     float64   `json:"cash_withdrawn" gorm:"column:cash_withdrawn;type:decimal(10,2);not null;default:0"`
	Notes             string    `json:"notes" gorm:"column:notes;type:text"`
	TotalSales        float64   `json:"total_sales" gorm:"column:total_sales;type:decimal(10,2);not null;default:0"`
	TotalRevenue      float64   `json:"total_revenue" gorm:"column:total_revenue;type:decimal(10,2);not null;default:0"`
	TotalCosts        float64   `json:"total_costs" gorm:"column:total_costs;type:decimal(10,2);not null;default:0"`
	TotalProfit       float64   `json:"total_profit" gorm:"column:total_profit;type:decimal(10,2);not null;default:0"`
	OrderCount        int       `json:"order_count" gorm:"column:order_count;type:int;not null;default:0"`
	AverageOrderValue float64   `json:"average_order_value" gorm:"column:average_order_value;type:decimal(10,2);not null;default:0"`
	CreatedAt         time.Time `json:"created_at" gorm:"column:created_at;type:timestamp;default:CURRENT_TIMESTAMP"`
	UpdatedAt         time.Time `json:"updated_at" gorm:"column:updated_at;type:timestamp;default:CURRENT_TIMESTAMP"`
}
