package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"restaurant_manager/tests/integration/utils"
	"testing"

	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"github.com/testcontainers/testcontainers-go"
)

func TestAddMenu(t *testing.T) {
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

	// Create form data for menu item
	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)
	writer.WriteField("name", "Burger")
	writer.WriteField("description", "Juicy beef burger")
	writer.WriteField("price", "10.99")
	writer.WriteField("category", "Main")
	writer.WriteField("available", "true")
	writer.Close()

	// Create request with the correct path
	req, _ := http.NewRequest("POST", fmt.Sprintf("/menus/%s/items", restaurantID), body)
	req.Header.Set("Content-Type", writer.FormDataContentType())

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["menu_item_id"])
	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestDeleteMenu(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID, menuItemID string

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

	result = mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://www.google.com') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Use the correct endpoint for deleting a menu item
	connStr := fmt.Sprintf("/menus/%s/items/%s", restaurantID, menuItemID)
	req, _ := http.NewRequest("DELETE", connStr, nil)
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusNoContent, response.Code)

	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestAddMenuItem(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID, menuID string

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

	result = mock.Db.Raw(`INSERT INTO servu.menus (restaurant_id, name)
		VALUES (?, 'Lunch menu') 
		RETURNING menu_id`, restaurantID).Scan(&menuID)
	if result.Error != nil {
		log.Err(result.Error)
	}
	itemData := map[string]string{
		"name":        "Burger",
		"description": "Juicy beef burger",
		"price":       "10.99",
		"available":   "true",
	}
	itemJSON, _ := json.Marshal(itemData)

	connStr := fmt.Sprintf("/menus/%s/items", menuID)
	req, _ := http.NewRequest("POST", connStr, bytes.NewBuffer(itemJSON))
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)
	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["menu_item_id"])
	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestDeleteMenuItem(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID, menuItemID string

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

	result = mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://www.google.com') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Use the correct endpoint for deleting a menu item
	connStr := fmt.Sprintf("/menus/%s/items/%s", restaurantID, menuItemID)
	req, _ := http.NewRequest("DELETE", connStr, nil)
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusNoContent, response.Code)

	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}
