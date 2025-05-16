package models

import "time"

type Inventory struct {
	InventoryID     string    `gorm:"primaryKey;column:inventory_id" json:"inventory_id"`
	RestaurantID    string    `gorm:"column:restaurant_id" json:"restaurant_id"`
	RawIngredientID string    `gorm:"column:raw_ingredient_id" json:"raw_ingredient_id"`
	Quantity        float64   `gorm:"column:quantity" json:"quantity"`
	Unit            string    `gorm:"column:unit" json:"unit"`
	MinimumQuantity float64   `gorm:"column:minimum_quantity" json:"minimum_quantity"`
	LastRestockDate time.Time `gorm:"column:last_restock_date" json:"last_restock_date"`
	Price           float64   `gorm:"column:price" json:"price"`
	CreatedAt       time.Time `gorm:"column:created_at;autoCreateTime" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at;autoUpdateTime" json:"updated_at"`

	//Relations
	RawIngredient RawIngredient `gorm:"foreignKey:RawIngredientID;references:ID" json:"raw_ingredient"` // relación
}
