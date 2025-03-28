package models

import "time"

type Restaurant struct {
	RestaurantID string    `db:"restaurant_id" json:"restaurant_id"`
	Name         string    `db:"name" json:"name"`
	OwnerID      string    `db:"owner_id" json:"owner_id"`
	Address      string    `db:"address" json:"address"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}
