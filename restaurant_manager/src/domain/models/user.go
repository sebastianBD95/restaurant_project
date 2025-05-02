package models

import "time"

type User struct {
	UserID       string    `db:"user_id" json:"-"`
	Name         string    `db:"name" json:"name"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"password"`
	Role         string    `db:"role" json:"role"`
	IdNumber     *string   `db:"id_number" json:"id_number,omitempty"`
	Phone        string    `db:"phone" json:"phone"`
	CompanyName  *string   `db:"company_name" json:"company_name,omitempty"`
	RestaurantId *string   `db:"restaurant_id" json:"restaurant_id,omitempty"`
	NitNumber    *string   `db:"nit_number" json:"nit_number,omitempty"`
	CreatedAt    time.Time `db:"created_at" json:"-"`
}
