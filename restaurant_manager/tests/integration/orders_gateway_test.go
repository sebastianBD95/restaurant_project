package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/interfaces/handlers/dto"
	"restaurant_manager/tests/integration/utils"
	"testing"

	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
)

func TestCreateOrder(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID, tableID, menuItemID string

	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id, description, image_url)
		VALUES ('Test Restaurant', ?, 'Test Description', 'https://test.com') 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code)
		VALUES (?, 2, 'QR_CODE') 
		RETURNING table_id`, restaurantID).Scan(&tableID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://www.google.com') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	orderData := dto.OrderDTO{
		TableID:      tableID,
		Status:       "ordered",
		RestaurantID: restaurantID,
		Items: []dto.OrderItemDTO{
			{
				MenuItemID:  menuItemID,
				Name:        "Burger",
				Quantity:    2,
				Price:       10.99,
				Status:      "pending",
				Observation: "",
				Image:       "https://www.google.com",
			},
		},
		TotalPrice: 21.98,
	}
	orderJSON, _ := json.Marshal(orderData)

	req, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["order_id"])
}

func TestDeleteOrder(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID, tableID, menuItemID string

	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, description, image_url, owner_id)
		VALUES ('Test Restaurant', 'Test Description', 'https://test.com', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code)
		VALUES (?, 2, 'QR_CODE') 
		RETURNING table_id`, restaurantID).Scan(&tableID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://www.google.com') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	orderData := dto.OrderDTO{
		TableID:      tableID,
		Status:       "ordered",
		RestaurantID: restaurantID,
		Items: []dto.OrderItemDTO{
			{
				MenuItemID:  menuItemID,
				Name:        "Burger",
				Quantity:    2,
				Price:       10.99,
				Status:      "pending",
				Observation: "",
				Image:       "https://www.google.com",
			},
		},
		TotalPrice: 21.98,
	}
	orderJSON, _ := json.Marshal(orderData)

	req, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	orderID := responseBody["order_id"]
	assert.NotEmpty(t, orderID)

	// Delete the order
	deleteReq, _ := http.NewRequest("DELETE", "/orders/"+orderID, nil)
	deleteResponse := fixture.Mock.ExecuteRequest(deleteReq, fixture.Router)
	assert.Equal(t, http.StatusNoContent, deleteResponse.Code)
}

func TestOrderWithSideDish(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	token := utils.LoginAndGetToken(t, fixture.Router, "alice@admin.com", "admin123")

	orderData := dto.OrderDTO{
		TableID:      "bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
		Table:        1,
		Status:       "ordered",
		RestaurantID: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
		Items: []dto.OrderItemDTO{
			{
				MenuItemID:  "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
				Name:        "Bife a la Criolla",
				Quantity:    1,
				Price:       50000,
				Status:      "pending",
				Observation: "",
				Image:       "https://servu-web.s3.us-east-1.amazonaws.com/TestMock/menu/bife.jpg",
			},
			{
				MenuItemID:  "ccccccc3-cccc-cccc-cccc-ccccccccccc3",
				Name:        "Papas Fritas",
				Quantity:    1,
				Price:       0,
				Status:      "pending",
				Observation: "Guardicion bife a la criolla",
				Image:       "https://servu-web.s3.us-east-1.amazonaws.com/TestMock/menu/papas_fritas.jpg",
			},
			{
				MenuItemID:  "ccccccc3-cccc-cccc-cccc-ccccccccccc3",
				Name:        "Papas Fritas",
				Quantity:    1,
				Price:       8000,
				Status:      "pending",
				Observation: "",
				Image:       "https://servu-web.s3.us-east-1.amazonaws.com/TestMock/menu/papas_fritas.jpg",
			},
		},
		TotalPrice: 58000,
	}
	orderJSON, _ := json.Marshal(orderData)

	req, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["order_id"])
}
