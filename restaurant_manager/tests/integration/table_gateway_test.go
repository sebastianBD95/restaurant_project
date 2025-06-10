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

func TestAddTable(t *testing.T) {
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

	tableData := map[string]interface{}{
		"restaurant_id": restaurantID,
		"table_number":  2,
		"qr_code":       "QR_CODE_URL_2",
		"status":        "available",
	}
	tableJSON, _ := json.Marshal(tableData)

	req, _ := http.NewRequest("POST", "/tables", bytes.NewBuffer(tableJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["table_id"])
	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestDeleteTable(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID, tableID string

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

	result = mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code, status)
		VALUES (?, 2, 'QR_CODE', 'available') 
		RETURNING table_id`, restaurantID).Scan(&tableID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	constStr := fmt.Sprintf("/tables/%s", tableID)

	req, _ := http.NewRequest("DELETE", constStr, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusNoContent, response.Code)

	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestGetTable(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID, tableID string

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

	result = mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code, status)
		VALUES (?, 2, 'QR_CODE', 'available') 
		RETURNING table_id`, restaurantID).Scan(&tableID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	constStr := fmt.Sprintf("/tables/%s", tableID)

	req, _ := http.NewRequest("GET", constStr, nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)
	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["table_id"])
	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestUpdateTable(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID, tableID string

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

	result = mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code, status)
		VALUES (?, 2, 'QR_CODE', 'available') 
		RETURNING table_id`, restaurantID).Scan(&tableID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	constStr := fmt.Sprintf("/tables/%s", tableID)
	tableData := map[string]interface{}{
		"restaurant_id": restaurantID,
		"table_number":  2,
		"qr_code":       "QR_CODE_URL_3",
		"status":        "available",
	}
	tableJSON, _ := json.Marshal(tableData)

	req, _ := http.NewRequest("PUT", constStr, bytes.NewBuffer(tableJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+token)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}
