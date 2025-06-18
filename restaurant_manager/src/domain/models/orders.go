package models

import "time"

type Order struct {
	OrderID       string      `gorm:"primaryKey;column:order_id"`
	TableID       string      `gorm:"column:table_id"`
	RestaurantID  string      `gorm:"column:restaurant_id"`
	Status        OrderStatus `gorm:"column:status"`
	TotalPrice    float64     `gorm:"column:total_price"`
	Observation   *string     `gorm:"column:observation"`
	TimeToPrepare float64     `gorm:"column:time_to_prepare"`
	TimeToDeliver float64     `gorm:"column:time_to_deliver"`
	TimeToPay     float64     `gorm:"column:time_to_pay"`
	CreatedAt     time.Time   `gorm:"column:created_at"`

	// Relations
	OrderItems []OrderItem `gorm:"foreignKey:OrderID;references:OrderID"`
	Table      Table       `gorm:"foreignKey:TableID;references:TableID"`
}

type OrderStatus string

const (
	Ordered   OrderStatus = "ordered"
	Prepared  OrderStatus = "prepared"
	Delivered OrderStatus = "delivered"
	Paid      OrderStatus = "paid"
	Cancelled OrderStatus = "cancelled"
	Completed OrderStatus = "completed"
)

type OrderItem struct {
	OrderID     string      `gorm:"primaryKey;column:order_id"`
	MenuItemID  string      `gorm:"primaryKey;column:menu_item_id"`
	Quantity    int         `gorm:"column:quantity"`
	Price       float64     `gorm:"column:price"`
	Status      OrderStatus `gorm:"column:status"`
	Observation *string     `gorm:"primaryKey;column:observation"`
	MenuItem    MenuItem    `gorm:"foreignKey:MenuItemID;references:MenuItemID"`
}

type VoidOrderItem struct {
	VoidOrderItemID string              `gorm:"primaryKey;column:void_order_item_id"`
	RestaurantID    string              `gorm:"column:restaurant_id"`
	MenuItemID      string              `gorm:"column:menu_item_id"`
	Quantity        int                 `gorm:"column:quantity"`
	Price           float64             `gorm:"column:price"`
	Observation     string              `gorm:"column:observation"`
	MenuItem        MenuItem            `gorm:"foreignKey:MenuItemID;references:MenuItemID"`
	VoidReason      string              `gorm:"column:void_reason"`
	Status          VoidOrderItemStatus `gorm:"column:status"`
	CreatedAt       time.Time           `gorm:"column:created_at"`
}

type VoidOrderItemStatus string

const (
	VoidOrderItemRecovered VoidOrderItemStatus = "recovered"
	VoidOrderItemVoided    VoidOrderItemStatus = "voided"
)
