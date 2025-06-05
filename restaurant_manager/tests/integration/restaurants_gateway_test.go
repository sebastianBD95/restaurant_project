package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"restaurant_manager/tests/integration/utils"
	"testing"

	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func TestAddRestaurant(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := gorm.Open(postgres.Open("postgres://postgres:postgres@localhost:5434/servu?sslmode=disable"))
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID string

	result := testDB.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$fkLipV6Vn8KKo2uXK9JC8eA6dQFjW2RiHRJvmJP5LS3mNv1byZnqm', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	restaurantData := map[string]string{
		"name":     "Test Restaurant",
		"owner_id": userID,
		"address":  "123 Main St",
	}

	restaurantJSON, _ := json.Marshal(restaurantData)

	req, _ := http.NewRequest("POST", "/restaurants", bytes.NewBuffer(restaurantJSON))
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["restaurant_id"])
	utils.CleanUp(postgresContainer)
}

func TestDeleteRestaurant(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := gorm.Open(postgres.Open("postgres://postgres:postgres@localhost:5434/servu?sslmode=disable"))
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID string

	result := testDB.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$fkLipV6Vn8KKo2uXK9JC8eA6dQFjW2RiHRJvmJP5LS3mNv1byZnqm', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = testDB.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	constStr := fmt.Sprintf("/restaurants/%s", restaurantID)

	req, _ := http.NewRequest("DELETE", constStr, nil)
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusNoContent, response.Code)

	utils.CleanUp(postgresContainer)
}

func TestGetRestaurant(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := gorm.Open(postgres.Open("postgres://postgres:postgres@localhost:5434/servu?sslmode=disable"))
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID string

	result := testDB.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$fkLipV6Vn8KKo2uXK9JC8eA6dQFjW2RiHRJvmJP5LS3mNv1byZnqm', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = testDB.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	constStr := fmt.Sprintf("/restaurants/%s", restaurantID)

	req, _ := http.NewRequest("GET", constStr, nil)
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)
	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["restaurant_id"])
	utils.CleanUp(postgresContainer)
}

func TestUpdateRestaurant(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := gorm.Open(postgres.Open("postgres://postgres:postgres@localhost:5434/servu?sslmode=disable"))
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID string

	result := testDB.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$fkLipV6Vn8KKo2uXK9JC8eA6dQFjW2RiHRJvmJP5LS3mNv1byZnqm', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = testDB.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	constStr := fmt.Sprintf("/restaurants/%s", restaurantID)
	restaurantData := map[string]string{
		"name":     "Test Restaurant_2",
		"owner_id": userID,
		"address":  "123 Main St",
	}
	restaurantJSON, _ := json.Marshal(restaurantData)

	req, _ := http.NewRequest("PUT", constStr, bytes.NewBuffer(restaurantJSON))
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	utils.CleanUp(postgresContainer)
}
