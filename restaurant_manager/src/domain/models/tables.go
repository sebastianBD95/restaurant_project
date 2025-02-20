package models

import "time"

type Table struct {
	TableID      string    `db:"table_id" json:"table_id"`
	RestaurantID string    `db:"restaurant_id" json:"restaurant_id"`
	TableNumber  int       `db:"table_number" json:"table_number"`
	QRCode       string    `db:"qr_code" json:"qr_code"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}
