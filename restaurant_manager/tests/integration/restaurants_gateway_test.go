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
	"github.com/testcontainers/testcontainers-go"
)

func TestAddRestaurant(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID string

	result := mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Login to get token
	token := utils.LoginAndGetToken(t, router, "john@example.com", "admin123")

	restaurantData := map[string]string{
		"name":     "Test Restaurant",
		"owner_id": userID,
		"address":  "123 Main St",
	}

	restaurantJSON, _ := json.Marshal(restaurantData)

	req, _ := http.NewRequest("POST", "/restaurants", bytes.NewBuffer(restaurantJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["restaurant_id"])
	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestDeleteRestaurant(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID string

	result := mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Login to get token
	token := utils.LoginAndGetToken(t, router, "john@example.com", "admin123")

	constStr := fmt.Sprintf("/restaurants/%s", restaurantID)

	req, _ := http.NewRequest("DELETE", constStr, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusNoContent, response.Code)

	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestGetRestaurant(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID string

	result := mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Login to get token
	token := utils.LoginAndGetToken(t, router, "john@example.com", "admin123")

	constStr := fmt.Sprintf("/restaurants/%s", restaurantID)

	req, _ := http.NewRequest("GET", constStr, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)
	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["restaurant_id"])
	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestUpdateRestaurant(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID string

	result := mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Login to get token
	token := utils.LoginAndGetToken(t, router, "john@example.com", "admin123")

	constStr := fmt.Sprintf("/restaurants/%s", restaurantID)
	restaurantData := map[string]string{
		"name":     "Test Restaurant_2",
		"owner_id": userID,
		"address":  "123 Main St",
	}
	restaurantJSON, _ := json.Marshal(restaurantData)

	req, _ := http.NewRequest("PUT", constStr, bytes.NewBuffer(restaurantJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}
