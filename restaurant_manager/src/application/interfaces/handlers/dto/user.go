package dto

import "restaurant_manager/src/domain/models"

type UserResponse struct {
	UserID       string  `json:"user_id"`
	Name         string  `json:"name"`
	Email        string  `json:"email"`
	Role         string  `json:"role"`
	IdNumber     *string `json:"id_number,omitempty"`
	Phone        string  `json:"phone"`
	CompanyName  *string `json:"company_name,omitempty"`
	RestaurantId *string `json:"restaurant_id,omitempty"`
	NitNumber    *string `json:"nit_number,omitempty"`
}

func FromUsertoUserResponse(u *models.User) UserResponse {
	return UserResponse{
		UserID:       u.UserID,
		Name:         u.Name,
		Email:        u.Email,
		Role:         u.Role,
		IdNumber:     u.IdNumber,
		Phone:        u.Phone,
		RestaurantId: u.RestaurantId,
		NitNumber:    u.NitNumber,
	}
}
