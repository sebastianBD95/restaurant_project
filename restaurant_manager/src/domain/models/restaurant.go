package models

import "time"

type Restaurant struct {
	RestaurantID string    `gorm:"primaryKey;column:restaurant_id" json:"restaurant_id"`
	Name         string    `gorm:"column:name" json:"name"`
	Description  string    `gorm:"column:description" json:"description"`
	OwnerID      string    `gorm:"column:owner_id" json:"owner_id"`
	ImageURL     string    `gorm:"column:image_url" json:"image_url"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"created_at"`
}
