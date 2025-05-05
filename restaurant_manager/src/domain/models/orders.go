package models

import "time"

type Order struct {
	OrderID      string      `gorm:"primaryKey;column:order_id"`
	TableID      string      `gorm:"column:table_id"`
	RestaurantID string      `gorm:"column:restaurant_id"`
	Status       OrderStatus `gorm:"column:status"`
	TotalPrice   float64     `gorm:"column:total_price"`
	Observation  *string     `gorm:"column:observation"`
	CreatedAt    time.Time   `gorm:"column:created_at"`

	// Relations
	OrderItems []OrderItem `gorm:"foreignKey:OrderID;references:OrderID"`
	Table      Table       `gorm:"foreignKey:TableID;references:TableID"`
}

type OrderStatus string

const (
	Ordered   OrderStatus = "ordered"
	Delivered OrderStatus = "delivered"
	Payed     OrderStatus = "payed"
	cancelled OrderStatus = "cancelled"
)

type OrderItem struct {
	OrderID     string   `gorm:"primaryKey;column:order_id"`
	MenuItemID  string   `gorm:"primaryKey;column:menu_item_id"`
	Quantity    int      `gorm:"column:quantity"`
	Price       float64  `gorm:"column:price"`
	Observation *string  `gorm:"column:observation"`
	MenuItem    MenuItem `gorm:"foreignKey:MenuItemID;references:MenuItemID"`
}
