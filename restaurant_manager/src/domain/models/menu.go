package models

import "time"

type Menu struct {
	MenuID       string    `db:"menu_id" json:"menu_id"`
	RestaurantID string    `db:"restaurant_id" json:"restaurant_id"`
	Name         string    `db:"name" json:"name"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}

type MenuItem struct {
	MenuItemID  string    `db:"menu_item_id" json:"menu_item_id"`
	MenuID      string    `db:"menu_id" json:"menu_id"`
	Name        string    `db:"name" json:"name"`
	Description string    `db:"description" json:"description"`
	Price       float64   `db:"price" json:"price"`
	Available   bool      `db:"available" json:"available"`
	CreatedAt   time.Time `db:"created_at" json:"created_at"`
}
