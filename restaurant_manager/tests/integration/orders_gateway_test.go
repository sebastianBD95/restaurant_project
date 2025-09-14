package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/interfaces/handlers/dto"
	"restaurant_manager/tests/integration/utils"
	"testing"

	"restaurant_manager/src/domain/models"

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

func TestRecoverVoidOrderItem(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID, tableID, menuItemID, orderID string

	// Create test data
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

	// Create an order
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
				Observation: "Test void",
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
	orderID = responseBody["order_id"]

	// Create a void order item
	voidItemData := struct {
		RestaurantID string `json:"restaurantId"`
		Observation  string `json:"observation"`
	}{
		RestaurantID: restaurantID,
		Observation:  "Test void",
	}
	voidItemJSON, _ := json.Marshal(voidItemData)

	voidReq, _ := http.NewRequest("POST", "/orders/"+orderID+"/items/"+menuItemID+"/void", bytes.NewBuffer(voidItemJSON))
	voidResponse := fixture.Mock.ExecuteRequest(voidReq, fixture.Router)
	assert.Equal(t, http.StatusNoContent, voidResponse.Code)

	// Get void order items to get the void order item ID
	getVoidReq, _ := http.NewRequest("GET", "/restaurants/"+restaurantID+"/order-items/void", nil)
	getVoidResponse := fixture.Mock.ExecuteRequest(getVoidReq, fixture.Router)
	assert.Equal(t, http.StatusOK, getVoidResponse.Code)

	var voidItems []dto.OrderItemDTO
	json.Unmarshal(getVoidResponse.Body.Bytes(), &voidItems)
	assert.Len(t, voidItems, 1)

	// Create a new order to recover the void item to (with a matching item)
	newOrderData := dto.OrderDTO{
		TableID:      tableID,
		Status:       "ordered",
		RestaurantID: restaurantID,
		Items: []dto.OrderItemDTO{
			{
				MenuItemID:  menuItemID,
				Name:        "Burger",
				Quantity:    1,
				Price:       10.99,
				Status:      "pending",
				Observation: "Test void",
				Image:       "https://www.google.com",
			},
		},
		TotalPrice: 10.99,
	}
	newOrderJSON, _ := json.Marshal(newOrderData)

	newOrderReq, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(newOrderJSON))
	newOrderResponse := fixture.Mock.ExecuteRequest(newOrderReq, fixture.Router)
	assert.Equal(t, http.StatusOK, newOrderResponse.Code)

	var newOrderResponseBody map[string]string
	json.Unmarshal(newOrderResponse.Body.Bytes(), &newOrderResponseBody)
	newOrderID := newOrderResponseBody["order_id"]

	// Recover the void order item
	recoveryData := dto.RecoverVoidOrderItemDTO{
		TargetOrderID: newOrderID,
	}
	recoveryJSON, _ := json.Marshal(recoveryData)

	// We need to get the actual void order item ID from the database
	var voidOrderItemIDFromDB string
	result = fixture.Mock.Db.Raw(`SELECT void_order_item_id FROM servu.void_order_items WHERE restaurant_id = ? LIMIT 1`, restaurantID).Scan(&voidOrderItemIDFromDB)
	if result.Error != nil {
		log.Err(result.Error)
	}

	recoveryReq, _ := http.NewRequest("POST", "/void-order-items/"+voidOrderItemIDFromDB+"/recover", bytes.NewBuffer(recoveryJSON))
	recoveryResponse := fixture.Mock.ExecuteRequest(recoveryReq, fixture.Router)
	assert.Equal(t, http.StatusNoContent, recoveryResponse.Code)

	// Verify the void item was deleted
	getVoidReqAfter, _ := http.NewRequest("GET", "/restaurants/"+restaurantID+"/order-items/void", nil)
	getVoidResponseAfter := fixture.Mock.ExecuteRequest(getVoidReqAfter, fixture.Router)
	assert.Equal(t, http.StatusOK, getVoidResponseAfter.Code)

	var voidItemsAfter []dto.OrderItemDTO
	json.Unmarshal(getVoidResponseAfter.Body.Bytes(), &voidItemsAfter)
	assert.Len(t, voidItemsAfter, 0)

	// Verify the new order has the recovered item (quantity should be increased)
	getOrderReq, _ := http.NewRequest("GET", "/orders/"+newOrderID, nil)
	getOrderResponse := fixture.Mock.ExecuteRequest(getOrderReq, fixture.Router)
	assert.Equal(t, http.StatusOK, getOrderResponse.Code)

	var order models.Order
	json.Unmarshal(getOrderResponse.Body.Bytes(), &order)
	assert.Len(t, order.OrderItems, 1)
	assert.Equal(t, menuItemID, order.OrderItems[0].MenuItemID)
	assert.Equal(t, 1, order.OrderItems[0].Quantity)
}

func TestRecoverVoidOrderItemNoMatchingItem(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	var userID, restaurantID, tableID, menuItemID, orderID string

	// Create test data
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

	// Create an order
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
				Observation: "Test void",
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
	orderID = responseBody["order_id"]

	// Create a void order item
	voidItemData := struct {
		RestaurantID string `json:"restaurantId"`
		Observation  string `json:"observation"`
	}{
		RestaurantID: restaurantID,
		Observation:  "Test void",
	}
	voidItemJSON, _ := json.Marshal(voidItemData)

	voidReq, _ := http.NewRequest("POST", "/orders/"+orderID+"/items/"+menuItemID+"/void", bytes.NewBuffer(voidItemJSON))
	voidResponse := fixture.Mock.ExecuteRequest(voidReq, fixture.Router)
	assert.Equal(t, http.StatusNoContent, voidResponse.Code)

	// Create a new order WITHOUT a matching item
	newOrderData := dto.OrderDTO{
		TableID:      tableID,
		Status:       "ordered",
		RestaurantID: restaurantID,
		Items:        []dto.OrderItemDTO{}, // No items
		TotalPrice:   0,
	}
	newOrderJSON, _ := json.Marshal(newOrderData)

	newOrderReq, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(newOrderJSON))
	newOrderResponse := fixture.Mock.ExecuteRequest(newOrderReq, fixture.Router)
	assert.Equal(t, http.StatusOK, newOrderResponse.Code)

	var newOrderResponseBody map[string]string
	json.Unmarshal(newOrderResponse.Body.Bytes(), &newOrderResponseBody)
	newOrderID := newOrderResponseBody["order_id"]

	// Try to recover the void order item (should fail)
	recoveryData := dto.RecoverVoidOrderItemDTO{
		TargetOrderID: newOrderID,
	}
	recoveryJSON, _ := json.Marshal(recoveryData)

	// Get the void order item ID from the database
	var voidOrderItemIDFromDB string
	result = fixture.Mock.Db.Raw(`SELECT void_order_item_id FROM servu.void_order_items WHERE restaurant_id = ? LIMIT 1`, restaurantID).Scan(&voidOrderItemIDFromDB)
	if result.Error != nil {
		log.Err(result.Error)
	}

	recoveryReq, _ := http.NewRequest("POST", "/void-order-items/"+voidOrderItemIDFromDB+"/recover", bytes.NewBuffer(recoveryJSON))
	recoveryResponse := fixture.Mock.ExecuteRequest(recoveryReq, fixture.Router)
	assert.Equal(t, http.StatusInternalServerError, recoveryResponse.Code) // Should fail because no matching item

	// Verify the void item still exists (was not deleted)
	getVoidReq, _ := http.NewRequest("GET", "/restaurants/"+restaurantID+"/order-items/void", nil)
	getVoidResponse := fixture.Mock.ExecuteRequest(getVoidReq, fixture.Router)
	assert.Equal(t, http.StatusOK, getVoidResponse.Code)

	var voidItems []dto.OrderItemDTO
	json.Unmarshal(getVoidResponse.Body.Bytes(), &voidItems)
	assert.Len(t, voidItems, 1) // Should still have 1 void item
}

// TestGetOrderByRestaurantID tests the GetOrderByRestaurantID handler with various query parameters
func TestGetOrderByRestaurantID(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	// Setup test data
	var userID, restaurantID, tableID1, tableID2, menuItemID1, menuItemID2 string

	// Create user
	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('Test User', 'test@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	assert.NoError(t, result.Error)

	// Create restaurant
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id, description, image_url)
		VALUES ('Test Restaurant', ?, 'Test Description', 'https://test.com') 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	assert.NoError(t, result.Error)

	// Create tables
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code, status)
		VALUES (?, 1, 'QR_CODE_1', 'available') 
		RETURNING table_id`, restaurantID).Scan(&tableID1)
	assert.NoError(t, result.Error)

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code, status)
		VALUES (?, 2, 'QR_CODE_2', 'available') 
		RETURNING table_id`, restaurantID).Scan(&tableID2)
	assert.NoError(t, result.Error)

	// Create menu items
	result = fixture.Mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://example.com/burger.jpg') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID1)
	assert.NoError(t, result.Error)

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Pizza', 'Margherita pizza', 15.99, true, 'Main', 'https://example.com/pizza.jpg') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID2)
	assert.NoError(t, result.Error)

	// Create orders with different statuses and dates
	orderData1 := dto.OrderDTO{
		TableID:      tableID1,
		Status:       "ordered",
		RestaurantID: restaurantID,
		Items: []dto.OrderItemDTO{
			{
				MenuItemID:  menuItemID1,
				Name:        "Burger",
				Quantity:    2,
				Price:       10.99,
				Status:      "pending",
				Observation: "",
				Image:       "https://example.com/burger.jpg",
			},
		},
		TotalPrice: 21.98,
	}
	orderJSON1, _ := json.Marshal(orderData1)
	req1, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON1))
	response1 := fixture.Mock.ExecuteRequest(req1, fixture.Router)
	assert.Equal(t, http.StatusOK, response1.Code)

	orderData2 := dto.OrderDTO{
		TableID:      tableID2,
		Status:       "prepared",
		RestaurantID: restaurantID,
		Items: []dto.OrderItemDTO{
			{
				MenuItemID:  menuItemID2,
				Name:        "Pizza",
				Quantity:    1,
				Price:       15.99,
				Status:      "completed",
				Observation: "",
				Image:       "https://example.com/pizza.jpg",
			},
		},
		TotalPrice: 15.99,
	}
	orderJSON2, _ := json.Marshal(orderData2)
	req2, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON2))
	response2 := fixture.Mock.ExecuteRequest(req2, fixture.Router)
	assert.Equal(t, http.StatusOK, response2.Code)

	// Test 1: Get all orders by restaurant ID
	t.Run("GetAllOrdersByRestaurantID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/orders?restaurant_id="+restaurantID, nil)
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var orders []dto.OrderDTO
		err := json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		assert.Len(t, orders, 2)
	})

	// Test 2: Filter by status
	t.Run("FilterByStatus", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/orders?restaurant_id="+restaurantID+"&status=ordered", nil)
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var orders []dto.OrderDTO
		err := json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		assert.Len(t, orders, 1)
		assert.Equal(t, "ordered", orders[0].Status)
	})

	// Test 3: Filter by table ID
	t.Run("FilterByTableID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/orders?restaurant_id="+restaurantID+"&table_id="+tableID1, nil)
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var orders []dto.OrderDTO
		err := json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		assert.Len(t, orders, 1)
		assert.Equal(t, tableID1, orders[0].TableID)
	})

	// Test 4: Filter by date range (today)
	t.Run("FilterByDateRange", func(t *testing.T) {
		today := "2024-01-01"
		req, _ := http.NewRequest("GET", "/orders?restaurant_id="+restaurantID+"&start_date="+today+"&end_date="+today, nil)
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var orders []dto.OrderDTO
		err := json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		// Should return all orders created today (both orders)
		assert.Len(t, orders, 2)
	})

	// Test 5: Combined filters
	t.Run("CombinedFilters", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/orders?restaurant_id="+restaurantID+"&status=ordered&table_id="+tableID1, nil)
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var orders []dto.OrderDTO
		err := json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		assert.Len(t, orders, 1)
		assert.Equal(t, "ordered", orders[0].Status)
		assert.Equal(t, tableID1, orders[0].TableID)
	})

	// Test 6: Empty result
	t.Run("EmptyResult", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/orders?restaurant_id="+restaurantID+"&status=paid", nil)
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var orders []dto.OrderDTO
		err := json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		assert.Len(t, orders, 0)
	})

	// Test 7: Invalid restaurant ID
	t.Run("InvalidRestaurantID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/orders?restaurant_id=invalid-id", nil)
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var orders []dto.OrderDTO
		err := json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		assert.Len(t, orders, 0)
	})

	// Test 8: Missing restaurant ID
	t.Run("MissingRestaurantID", func(t *testing.T) {
		req, _ := http.NewRequest("GET", "/orders", nil)
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var orders []dto.OrderDTO
		err := json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		// Should return empty array when no restaurant_id is provided
		assert.Len(t, orders, 0)
	})
}

// TestGetOrderByRestaurantIDWithMultipleStatuses tests filtering with multiple order statuses
func TestGetOrderByRestaurantIDWithMultipleStatuses(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	// Setup test data
	var userID, restaurantID, tableID, menuItemID string

	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('Test User', 'test@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	assert.NoError(t, result.Error)

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id, description, image_url)
		VALUES ('Test Restaurant', ?, 'Test Description', 'https://test.com') 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	assert.NoError(t, result.Error)

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code, status)
		VALUES (?, 1, 'QR_CODE', 'available') 
		RETURNING table_id`, restaurantID).Scan(&tableID)
	assert.NoError(t, result.Error)

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://example.com/burger.jpg') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID)
	assert.NoError(t, result.Error)

	// Create orders with different statuses
	statuses := []string{"ordered", "prepared", "delivered", "paid", "cancelled"}
	var orderIDs []string

	for _, status := range statuses {
		orderData := dto.OrderDTO{
			TableID:      tableID,
			Status:       status,
			RestaurantID: restaurantID,
			Items: []dto.OrderItemDTO{
				{
					MenuItemID:  menuItemID,
					Name:        "Burger",
					Quantity:    1,
					Price:       10.99,
					Status:      "pending",
					Observation: "",
					Image:       "https://example.com/burger.jpg",
				},
			},
			TotalPrice: 10.99,
		}
		orderJSON, _ := json.Marshal(orderData)
		req, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON))
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var responseBody map[string]string
		json.Unmarshal(response.Body.Bytes(), &responseBody)
		orderIDs = append(orderIDs, responseBody["order_id"])
	}

	// Test each status filter
	for _, status := range statuses {
		t.Run("FilterByStatus_"+status, func(t *testing.T) {
			req, _ := http.NewRequest("GET", "/orders?restaurant_id="+restaurantID+"&status="+status, nil)
			response := fixture.Mock.ExecuteRequest(req, fixture.Router)
			assert.Equal(t, http.StatusOK, response.Code)

			var orders []dto.OrderDTO
			err := json.Unmarshal(response.Body.Bytes(), &orders)
			assert.NoError(t, err)
			assert.Len(t, orders, 1)
			assert.Equal(t, status, orders[0].Status)
		})
	}
}

// TestGetOrderByRestaurantIDWithDateFiltering tests date range filtering functionality
func TestGetOrderByRestaurantIDWithDateFiltering(t *testing.T) {
	fixture := NewTestFixture(t)
	defer fixture.TearDown()

	// Setup test data
	var userID, restaurantID, tableID, menuItemID string

	result := fixture.Mock.Db.Raw(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('Test User', 'test@example.com', '$2a$10$OadQYtj4KxIpkjOQ/zw62euZ00cLJDUmUGMJ5bdGU2TE1.6GwKsoa', 'admin', '1234567890')
		RETURNING user_id`).Scan(&userID)
	assert.NoError(t, result.Error)

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.restaurants (name, owner_id, description, image_url)
		VALUES ('Test Restaurant', ?, 'Test Description', 'https://test.com') 
		RETURNING restaurant_id`, userID).Scan(&restaurantID)
	assert.NoError(t, result.Error)

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.tables (restaurant_id, table_number, qr_code, status)
		VALUES (?, 1, 'QR_CODE', 'available') 
		RETURNING table_id`, restaurantID).Scan(&tableID)
	assert.NoError(t, result.Error)

	result = fixture.Mock.Db.Raw(`INSERT INTO servu.menu_items (restaurant_id, name, description, price, available, category, image_url)
		VALUES (?, 'Burger', 'Juicy beef burger', 10.99, true, 'Main', 'https://example.com/burger.jpg') 
		RETURNING menu_item_id`, restaurantID).Scan(&menuItemID)
	assert.NoError(t, result.Error)

	// Create multiple orders
	for i := 0; i < 3; i++ {
		orderData := dto.OrderDTO{
			TableID:      tableID,
			Status:       "ordered",
			RestaurantID: restaurantID,
			Items: []dto.OrderItemDTO{
				{
					MenuItemID:  menuItemID,
					Name:        "Burger",
					Quantity:    1,
					Price:       10.99,
					Status:      "pending",
					Observation: "",
					Image:       "https://example.com/burger.jpg",
				},
			},
			TotalPrice: 10.99,
		}
		orderJSON, _ := json.Marshal(orderData)
		req, _ := http.NewRequest("POST", "/orders", bytes.NewBuffer(orderJSON))
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)
	}

	// Test date range filtering
	t.Run("DateRangeFiltering", func(t *testing.T) {
		today := "2024-01-01"
		tomorrow := "2024-01-02"

		// Test with start_date only
		req, _ := http.NewRequest("GET", "/orders?restaurant_id="+restaurantID+"&start_date="+today, nil)
		response := fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		var orders []dto.OrderDTO
		err := json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		assert.Len(t, orders, 3) // Should return all orders from today onwards

		// Test with end_date only
		req, _ = http.NewRequest("GET", "/orders?restaurant_id="+restaurantID+"&end_date="+tomorrow, nil)
		response = fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		err = json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		assert.Len(t, orders, 3) // Should return all orders up to tomorrow

		// Test with both dates
		req, _ = http.NewRequest("GET", "/orders?restaurant_id="+restaurantID+"&start_date="+today+"&end_date="+today, nil)
		response = fixture.Mock.ExecuteRequest(req, fixture.Router)
		assert.Equal(t, http.StatusOK, response.Code)

		err = json.Unmarshal(response.Body.Bytes(), &orders)
		assert.NoError(t, err)
		assert.Len(t, orders, 3) // Should return orders from today only
	})
}
