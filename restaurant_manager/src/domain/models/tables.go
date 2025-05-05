package models

import "time"

type TableStatus string

const (
	TableStatusAvailable TableStatus = "available"
	TableStatusOccupied  TableStatus = "occupied"
	TableStatusReserved  TableStatus = "reserved"
)

type Table struct {
	TableID      string      `gorm:"primaryKey;column:table_id" json:"table_id"`
	RestaurantID string      `gorm:"column:restaurant_id" json:"restaurant_id"`
	TableNumber  int         `gorm:"column:table_number" json:"table_number"`
	QRCode       string      `gorm:"column:qr_code" json:"qr_code"`
	Status       TableStatus `gorm:"column:status" json:"status"`
	CreatedAt    time.Time   `gorm:"column:created_at" json:"created_at"`
}
