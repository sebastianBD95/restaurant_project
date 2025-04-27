package models

import "time"

type Menu struct {
	MenuID       string    `db:"menu_id" json:"menu_id"`
	RestaurantID string    `db:"restaurant_id" json:"restaurant_id"`
	Name         string    `db:"name" json:"name"`
	Description  string    `db:"description" json:"description"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type MenuItem struct {
	MenuItemID   string    `db:"menu_item_id" json:"menu_item_id"`
	RestaurantID string    `db:"restaurant_id" json:"restaurant_id"`
	Name         string    `db:"name" json:"name"`
	Description  string    `db:"description" json:"description"`
	Price        float64   `db:"price" json:"price"`
	Available    bool      `db:"available" json:"available"`
	ImageURL     string    `db:"image_url" json:"image_url"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
	Category     Category  `db:"category" json:"category"`
}

type Category string

const (
	Appetizer Category = "Appetizer"
	Dessert   Category = "Dessert"
	Main      Category = "Main"
	Soup      Category = "Soup"
	Salad     Category = "Salad"
	Drinks    Category = "Drinks"
)
