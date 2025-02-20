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

type OrderItem struct {
	OrderItemID string    `db:"order_item_id" json:"order_item_id"`
	OrderID     string    `db:"order_id" json:"order_id"`
	MenuItemID  string    `db:"menu_item_id" json:"menu_item_id"`
	Quantity    int       `db:"quantity" json:"quantity"`
	Price       float64   `db:"price" json:"price"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
}
