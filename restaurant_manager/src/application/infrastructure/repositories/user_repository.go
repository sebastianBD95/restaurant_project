package repositories

import (
	"database/sql"
	"errors"
	"fmt"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"

	"github.com/jmoiron/sqlx"
	"golang.org/x/crypto/bcrypt"
)

type UserRepositoryImpl struct {
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) repositories.UserRepository {
	return &UserRepositoryImpl{db: db}
}

// CreateUser stores a new user with a hashed password
func (repo *UserRepositoryImpl) CreateUser(user *models.User) (string, error) {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(user.PasswordHash), bcrypt.DefaultCost)
	if err != nil {
		return "", fmt.Errorf("failed to hash password: %w", err)
	}

	// Base query for all users
	baseQuery := `INSERT INTO servu.users (name, email, password_hash, phone, role, restaurant_id ,created_at) 
	              VALUES ($1, $2, $3, $4, $5,$6, NOW())`

	// Parameters for all users
	params := []interface{}{
		user.Name,
		user.Email,
		string(hashedPassword),
		user.Phone,
		user.Role,
		user.RestaurantId,
	}

	// Add additional fields for admin users
	if user.Role == "admin" {
		baseQuery = `INSERT INTO servu.users (name, email, password_hash, id_number, phone, nit_number, role, created_at) 
		             VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`
		params = []interface{}{
			user.Name,
			user.Email,
			string(hashedPassword),
			user.IdNumber,
			user.Phone,
			user.NitNumber,
			user.Role,
		}
	}

	// Add RETURNING clause
	query := baseQuery + " RETURNING user_id"

	var userID string
	err = repo.db.QueryRow(query, params...).Scan(&userID)
	if err != nil {
		return "", fmt.Errorf("failed to create user: %w", err)
	}

	return userID, nil
}

// GetUserByEmail retrieves a user by email
func (repo *UserRepositoryImpl) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	query := `SELECT * FROM servu.users WHERE email = $1`
	err := repo.db.Get(&user, query, email)

	if err == sql.ErrNoRows {
		return nil, errors.New("user not found")
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}

	return &user, nil
}

// GetUsersByRestaurantID retrieves all users associated with a restaurant
func (repo *UserRepositoryImpl) GetUsersByRestaurantIDAndRole(restaurantID string, role string) ([]*models.User, error) {
	var users []*models.User
	query := `SELECT * FROM servu.users WHERE restaurant_id = $1 AND role = $2`
	err := repo.db.Select(&users, query, restaurantID, role)
	if err != nil {
		return nil, fmt.Errorf("failed to get users by restaurant: %w", err)
	}
	return users, nil
}
