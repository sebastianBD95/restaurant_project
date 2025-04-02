package repositories

import (
	"database/sql"
	"errors"
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
		return "", err
	}

	query := `INSERT INTO servu.users (name, email, password_hash, id_number, phone, nit_number, role, created_at) 
	          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) RETURNING user_id`

	var userID string
	err = repo.db.QueryRow(query, user.Name, user.Email, string(hashedPassword), user.IdNumber, user.Phone, user.NitNumber, user.Role).Scan(&userID)
	if err != nil {
		return "", err
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
		return nil, err
	}

	return &user, nil
}
