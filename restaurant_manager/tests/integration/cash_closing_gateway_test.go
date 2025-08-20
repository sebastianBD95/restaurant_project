package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"restaurant_manager/src/application/interfaces/handlers/dto"
	"restaurant_manager/tests/integration/utils"
	"testing"

	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
)

func TestCreateCashClosing(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID string

	// Create test user
	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test restaurant
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test orders for the cash closing calculation
	createTestOrders(t, fixture, restaurantID)

	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	// Create cash closing request
	cashClosingRequest := dto.CashClosingRequest{
		ClosingDate:       "2025-08-15",
		CashInRegister:    1000.0,
		CashWithdrawn:     500.0,
		Notes:             "Test cash closing",
		TotalSales:        75000.0,
		TotalRevenue:      75000.0,
		TotalCosts:        31200.0,
		TotalProfit:       43800.0,
		OrderCount:        2,
		AverageOrderValue: 37500.0,
	}

	cashClosingJSON, _ := json.Marshal(cashClosingRequest)

	req, _ := http.NewRequest("POST", fmt.Sprintf("/cash-closings?restaurant_id=%s", restaurantID), bytes.NewBuffer(cashClosingJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusCreated, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["cash_closing_id"])
}

func TestGetCashClosingData(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID string

	// Create test user
	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test restaurant
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test orders for the cash closing calculation
	createTestOrders(t, fixture, restaurantID)

	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	// Get cash closing data
	req, _ := http.NewRequest("GET", fmt.Sprintf("/cash-closings/data?restaurant_id=%s&date=2025-08-15", restaurantID), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody dto.CashClosingData
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotZero(t, responseBody.TotalSales)
	assert.NotZero(t, responseBody.TotalRevenue)
	assert.NotZero(t, responseBody.TotalCosts)
	assert.NotZero(t, responseBody.TotalProfit)
	assert.NotZero(t, responseBody.OrderCount)
	assert.NotZero(t, responseBody.AverageOrderValue)
}

func TestGetCashClosingHistory(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID string

	// Create test user
	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test restaurant
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test cash closing records
	createTestCashClosings(t, fixture, restaurantID)

	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	// Get cash closing history
	req, _ := http.NewRequest("GET", fmt.Sprintf("/cash-closings/history?restaurant_id=%s&start_date=2025-08-01&end_date=2025-08-31", restaurantID), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody []dto.CashClosingResponse
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.Len(t, responseBody, 2) // Should have 2 cash closings
}

func TestUpdateCashClosing(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID, cashClosingID string

	// Create test user
	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test restaurant
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test cash closing
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.cash_closings (restaurant_id, closing_date, cash_in_register, cash_withdrawn, notes, total_sales, total_revenue, total_costs, total_profit, order_count, average_order_value)
		VALUES (?, '2025-08-15', 1000.0, 500.0, 'Original notes', 75000.0, 75000.0, 31200.0, 43800.0, 2, 37500.0)
		RETURNING cash_closing_id`, restaurantID).Scan(&cashClosingID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	// Update cash closing
	updateRequest := dto.CashClosingRequest{
		ClosingDate:       "2025-08-15",
		CashInRegister:    1200.0,
		CashWithdrawn:     600.0,
		Notes:             "Updated notes",
		TotalSales:        75000.0,
		TotalRevenue:      75000.0,
		TotalCosts:        31200.0,
		TotalProfit:       43800.0,
		OrderCount:        2,
		AverageOrderValue: 37500.0,
	}

	updateJSON, _ := json.Marshal(updateRequest)

	req, _ := http.NewRequest("PUT", fmt.Sprintf("/cash-closings/%s?restaurant_id=%s", cashClosingID, restaurantID), bytes.NewBuffer(updateJSON))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)
}

func TestDeleteCashClosing(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID, cashClosingID string

	// Create test user
	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test restaurant
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test cash closing
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.cash_closings (restaurant_id, closing_date, cash_in_register, cash_withdrawn, notes, total_sales, total_revenue, total_costs, total_profit, order_count, average_order_value)
		VALUES (?, '2025-08-15', 1000.0, 500.0, 'Test notes', 75000.0, 75000.0, 31200.0, 43800.0, 2, 37500.0)
		RETURNING cash_closing_id`, restaurantID).Scan(&cashClosingID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	// Delete cash closing
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("/cash-closings/%s", cashClosingID), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusNoContent, response.Code)
}

func TestGetCashClosingStats(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID string

	// Create test user
	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test restaurant
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id)
		VALUES ('Test Restaurant', ?) 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test cash closing records
	createTestCashClosings(t, fixture, restaurantID)

	token := utils.LoginAndGetToken(t, fixture.Router, "john@example.com", "admin123")

	// Get cash closing stats
	req, _ := http.NewRequest("GET", fmt.Sprintf("/cash-closings/stats?restaurant_id=%s&start_date=2025-08-01&end_date=2025-08-31", restaurantID), nil)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))

	response := fixture.Mock.ExecuteRequest(req, fixture.Router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody dto.CashClosingResponse
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotZero(t, responseBody.TotalSales)
	assert.NotZero(t, responseBody.TotalRevenue)
	assert.NotZero(t, responseBody.TotalCosts)
	assert.NotZero(t, responseBody.TotalProfit)
	assert.NotZero(t, responseBody.OrderCount)
	assert.NotZero(t, responseBody.AverageOrderValue)
}

// Helper functions

func createTestOrders(t *testing.T, fixture *TestFixture, restaurantID string) {
	// Create test menu items
	var menuItemID1, menuItemID2 string

	result := fixture.Mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 35000.0, true, 'Main', 'https://example.com/burger.jpg')
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID1)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Pizza', 'Delicious pizza', 40000.0, true, 'Main', 'https://example.com/pizza.jpg')
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID2)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Add ingredients to menu items for cost calculation
	fixture.Mock.Db.Exec(`INSERT INTO servu.ingredients (menu_item_id, raw_ingredient_id, amount, unit, price)
		VALUES (?, '107', 250, 'g', 15000.0)`, menuItemID1)

	fixture.Mock.Db.Exec(`INSERT INTO servu.ingredients (menu_item_id, raw_ingredient_id, amount, unit, price)
		VALUES (?, '2', 100, 'g', 8000.0)`, menuItemID1)

	fixture.Mock.Db.Exec(`INSERT INTO servu.ingredients (menu_item_id, raw_ingredient_id, amount, unit, price)
		VALUES (?, '107', 300, 'g', 18000.0)`, menuItemID2)

	fixture.Mock.Db.Exec(`INSERT INTO servu.ingredients (menu_item_id, raw_ingredient_id, amount, unit, price)
		VALUES (?, '3', 150, 'g', 12000.0)`, menuItemID2)

	// Create test table
	var tableID string
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code)
		VALUES (?, 1, 'QR_CODE_1')
		RETURNING table_id`, restaurantID).Scan(&tableID)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create test orders with valid status
	var orderID1, orderID2 string
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.orders (restaurant_id, table_id, status, total_price, created_at)
		VALUES (?, ?, 'paid', 35000.0, '2025-08-15 12:00:00')
		RETURNING order_id`, restaurantID, tableID).Scan(&orderID1)
	if result.Error != nil {
		log.Err(result.Error)
	}

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.orders (restaurant_id, table_id, status, total_price, created_at)
		VALUES (?, ?, 'paid', 40000.0, '2025-08-15 18:00:00')
		RETURNING order_id`, restaurantID, tableID).Scan(&orderID2)
	if result.Error != nil {
		log.Err(result.Error)
	}

	// Create order items with correct structure (no name column)
	fixture.Mock.Db.Exec(`INSERT INTO servu.order_items (order_id, menu_item_id, quantity, price, status, observation)
		VALUES (?, ?, 1, 35000.0, 'completed', 'Sin observaciones')`, orderID1, menuItemID1)

	fixture.Mock.Db.Exec(`INSERT INTO servu.order_items (order_id, menu_item_id, quantity, price, status, observation)
		VALUES (?, ?, 1, 40000.0, 'completed', 'Sin observaciones')`, orderID2, menuItemID2)
}

func createTestCashClosings(t *testing.T, fixture *TestFixture, restaurantID string) {
	// Create test cash closing records
	fixture.Mock.Db.Exec(`INSERT INTO servu.cash_closings (restaurant_id, closing_date, cash_in_register, cash_withdrawn, notes, total_sales, total_revenue, total_costs, total_profit, order_count, average_order_value)
		VALUES (?, '2025-08-15', 1000.0, 500.0, 'First closing', 75000.0, 75000.0, 31200.0, 43800.0, 2, 37500.0)`, restaurantID)

	fixture.Mock.Db.Exec(`INSERT INTO servu.cash_closings (restaurant_id, closing_date, cash_in_register, cash_withdrawn, notes, total_sales, total_revenue, total_costs, total_profit, order_count, average_order_value)
		VALUES (?, '2025-08-16', 1200.0, 600.0, 'Second closing', 80000.0, 80000.0, 35000.0, 45000.0, 3, 26666.67)`, restaurantID)
}
