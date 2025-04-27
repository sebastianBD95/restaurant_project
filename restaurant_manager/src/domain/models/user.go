package models

import "time"

type User struct {
	UserID       string    `db:"user_id" json:"user_id"`
	Name         string    `db:"name" json:"name"`
	Email        string    `db:"email" json:"email"`
	PasswordHash string    `db:"password_hash" json:"password,omitempty"`
	Role         string    `db:"role" json:"role"`
	IdNumber     string    `db:"id_number" json:"id_number"`
	Phone        string    `db:"phone" json:"phone"`
	CompanyName  string    `db:"company_name" json:"company_name"`
	NitNumber    string    `db:"nit_number" json:"nit_number"`
	CreatedAt    time.Time `db:"created_at" json:"created_at"`
}
