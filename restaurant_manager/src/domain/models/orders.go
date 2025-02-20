package models

import "time"

type Order struct {
	OrderID    string      `db:"order_id" json:"order_id"`
	TableID    string      `db:"table_id" json:"table_id"`
	Status     OrderStatus `db:"status" json:"status"`
	TotalPrice float64     `db:"total_price" json:"total_price"`
	CreatedAt  time.Time   `db:"created_at" json:"created_at"`
}

type OrderStatus string

const (
	Ordered   OrderStatus = "ordered"
	Delivered OrderStatus = "delivered"
	Payed     OrderStatus = "payed"
	cancelled OrderStatus = "cancelled"
)
