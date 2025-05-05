package models

import "time"

type User struct {
	UserID       string    `gorm:"primaryKey;column:user_id" json:"user_id"`
	Name         string    `gorm:"column:name" json:"name"`
	Email        string    `gorm:"column:email" json:"email"`
	PasswordHash string    `gorm:"column:password_hash" json:"password"`
	Role         string    `gorm:"column:role" json:"role"`
	IdNumber     *string   `gorm:"column:id_number" json:"id_number,omitempty"`
	Phone        string    `gorm:"column:phone" json:"phone"`
	RestaurantId *string   `gorm:"column:restaurant_id" json:"restaurant_id,omitempty"`
	NitNumber    *string   `gorm:"column:nit_number" json:"nit_number,omitempty"`
	CreatedAt    time.Time `gorm:"column:created_at" json:"-"`
}
