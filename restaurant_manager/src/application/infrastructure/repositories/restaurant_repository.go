package repositories

import (
	"github.com/jmoiron/sqlx"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type RestaurantRepositoryImpl struct {
	db *sqlx.DB
}

func NewRestaurantRepository(db *sqlx.DB) repositories.RestaurantRepository {
	return &RestaurantRepositoryImpl{db: db}
}

// Create a new restaurant
func (repo *RestaurantRepositoryImpl) CreateRestaurant(restaurant *models.Restaurant) (string, error) {
	query := `INSERT INTO servu.restaurants (name, owner_id, address)
	          VALUES ($1, $2, $3) RETURNING restaurant_id`
	var restaurantID string
	err := repo.db.QueryRow(query, restaurant.Name, restaurant.OwnerID, restaurant.Address).Scan(&restaurantID)
	return restaurantID, err
}

// Get a restaurant by ID
func (repo *RestaurantRepositoryImpl) GetRestaurant(restaurantID string) (*models.Restaurant, error) {
	var restaurant models.Restaurant
	query := `SELECT * FROM servu.restaurants WHERE restaurant_id = $1`
	err := repo.db.Get(&restaurant, query, restaurantID)
	if err != nil {
		return nil, err
	}
	return &restaurant, nil
}

// Update restaurant details
func (repo *RestaurantRepositoryImpl) UpdateRestaurant(restaurant *models.Restaurant) error {
	query := `UPDATE servu.restaurants SET name=$1, address=$2 WHERE restaurant_id=$3`
	_, err := repo.db.Exec(query, restaurant.Name, restaurant.Address, restaurant.RestaurantID)
	return err
}

// Delete a restaurant
func (repo *RestaurantRepositoryImpl) DeleteRestaurant(restaurantID string) error {
	_, err := repo.db.Exec(`DELETE FROM servu.restaurants WHERE restaurant_id = $1`, restaurantID)
	return err
}
