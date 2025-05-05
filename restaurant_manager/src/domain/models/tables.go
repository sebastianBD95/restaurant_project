package models

import "time"

type Table struct {
	TableID      string    `gorm:"primaryKey;column:table_id" json:"table_id"`
	RestaurantID string    `gorm:"column:restaurant_id" json:"restaurant_id"`
	TableNumber  int       `gorm:"column:table_number" json:"table_number"`
	QRCode       string    `gorm:"column:qr_code" json:"qr_code"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
}
