package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"restaurant_manager/tests/integration/utils"
	"testing"

	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"github.com/testcontainers/testcontainers-go"
)

func TestCreateOrder(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID, tableID, menuItemID string

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

	result = mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code)
		VALUES (?, 2, 'QR_CODE') 
		RETURNING table_id`, restaurantID).Scan(&tableID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://www.google.com') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	orderData := map[string]interface{}{
		"table_id": tableID,
		"status":   "ordered",
		"items": []map[string]interface{}{
			{
				"menu_item_id": menuItemID,
				"quantity":     "2",
			},
		},
	}
	orderJSON, _ := json.Marshal(orderData)

	req, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON))

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["order_id"])
	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}

func TestDeleteOrder(t *testing.T) {
	postgresContainer, flyContainer := utils.SetUp()
	mock := utils.NewMock()
	router := mock.SetRoutes()

	var userID, restaurantID, tableID, menuItemID string

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

	result = mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code)
		VALUES (?, 2, 'QR_CODE') 
		RETURNING table_id`, restaurantID).Scan(&tableID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://www.google.com') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	orderData := map[string]interface{}{
		"table_id": tableID,
		"status":   "ordered",
		"items": []map[string]interface{}{
			{
				"menu_item_id": menuItemID,
				"quantity":     "2",
			},
		},
	}
	orderJSON, _ := json.Marshal(orderData)

	req, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON))

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	orderID := responseBody["order_id"]
	assert.NotEmpty(t, orderID)

	// Delete the order
	deleteReq, _ := http.NewRequest("DELETE", "/orders/"+orderID, nil)
	deleteResponse := mock.ExecuteRequest(deleteReq, router)
	assert.Equal(t, http.StatusNoContent, deleteResponse.Code)

	utils.CleanUp([]testcontainers.Container{postgresContainer, flyContainer})
}
