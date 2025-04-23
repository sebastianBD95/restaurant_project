package models

import "time"

type Restaurant struct {
	RestaurantID string    `db:"restaurant_id" json:"restaurant_id"`
	Name         string    `db:"name" json:"name"`
	Description  string    `db:"description" json:"description"`
	OwnerID      string    `db:"owner_id" json:"owner_id"`
	ImageURL     string    `db:"image_url" json:"image_url"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}
