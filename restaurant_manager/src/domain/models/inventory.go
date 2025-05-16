package models

import "time"

type Inventory struct {
	InventoryID     string    `gorm:"primaryKey;column:inventory_id;table:servu.inventory" json:"inventory_id"`
	RestaurantID    string    `gorm:"column:restaurant_id" json:"restaurant_id"`
	IngredientID    string    `gorm:"column:ingredient_id" json:"ingredient_id"`
	Quantity        float64   `gorm:"column:quantity" json:"quantity"`
	Unit            string    `gorm:"column:unit" json:"unit"`
	MinimumQuantity float64   `gorm:"column:minimum_quantity" json:"minimum_quantity"`
	LastRestockDate time.Time `gorm:"column:last_restock_date" json:"last_restock_date"`
	CreatedAt       time.Time `gorm:"column:created_at" json:"created_at"`
	UpdatedAt       time.Time `gorm:"column:updated_at" json:"updated_at"`

	// Relations
	Ingredient Ingredient `gorm:"foreignKey:IngredientID;references:IngredientID"`
}
