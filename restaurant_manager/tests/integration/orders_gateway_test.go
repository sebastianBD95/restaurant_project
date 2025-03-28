package integration

import (
	"bytes"
	"encoding/json"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"net/http"
	"restaurant_manager/tests/integration/utils"
	"testing"
)

func TestCreateOrder(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID, tableID, menuID, menuItemID string

	err = testDB.QueryRow(`INSERT INTO servu.users (name, email, password_hash, role)
	VALUES ('John Doe', 'john@example.com', '$2a$10$fkLipV6Vn8KKo2uXK9JC8eA6dQFjW2RiHRJvmJP5LS3mNv1byZnqm', 'admin') 
	RETURNING user_id`).Scan(&userID)

	if err != nil {
		log.Err(err)
	}

	err = testDB.QueryRow(`INSERT INTO servu.restaurants (name, owner_id, address)
	VALUES ('Test Restaurant', $1, '123 Main St') 
	RETURNING restaurant_id`, userID).Scan(&restaurantID)

	if err != nil {
		log.Err(err)
	}

	err = testDB.QueryRow(`INSERT INTO servu.restaurant_tables (restaurant_id, table_number,qr_code)
	VALUES ($1, 2, 'QR_CODE') 
	RETURNING table_id`, restaurantID).Scan(&tableID)

	if err != nil {
		log.Err(err)
	}

	err = testDB.QueryRow(`INSERT INTO servu.menus (restaurant_id, name)
	VALUES ($1, 'Lunch menu') 
	RETURNING menu_id`, restaurantID).Scan(&menuID)

	if err != nil {
		log.Err(err)
	}

	err = testDB.QueryRow(`INSERT INTO servu.menu_items (menu_id, name,description,price,available,category,image_url)
	VALUES ($1, 'Burger','Juicy beef burger',10.99,true,'','https://www.google.com') 
	RETURNING menu_item_id`, menuID).Scan(&menuItemID)

	if err != nil {
		log.Err(err)
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
	utils.CleanUp(postgresContainer)
}

func TestDeleteOrder(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID, tableID, menuID, menuItemID string

	err = testDB.QueryRow(`INSERT INTO servu.users (name, email, password_hash, role)
	VALUES ('John Doe', 'john@example.com', '$2a$10$fkLipV6Vn8KKo2uXK9JC8eA6dQFjW2RiHRJvmJP5LS3mNv1byZnqm', 'admin') 
	RETURNING user_id`).Scan(&userID)

	if err != nil {
		log.Err(err)
	}

	err = testDB.QueryRow(`INSERT INTO servu.restaurants (name, owner_id, address)
	VALUES ('Test Restaurant', $1, '123 Main St') 
	RETURNING restaurant_id`, userID).Scan(&restaurantID)

	if err != nil {
		log.Err(err)
	}

	err = testDB.QueryRow(`INSERT INTO servu.restaurant_tables (restaurant_id, table_number,qr_code)
	VALUES ($1, 2, 'QR_CODE') 
	RETURNING table_id`, restaurantID).Scan(&tableID)

	if err != nil {
		log.Err(err)
	}

	err = testDB.QueryRow(`INSERT INTO servu.menus (restaurant_id, name)
	VALUES ($1, 'Lunch menu') 
	RETURNING menu_id`, restaurantID).Scan(&menuID)

	if err != nil {
		log.Err(err)
	}

	err = testDB.QueryRow(`INSERT INTO servu.menu_items (menu_id, name,description,price,available,category,image_url)
	VALUES ($1, 'Burger','Juicy beef burger',10.99,true,'','https://www.google.com') 
	RETURNING menu_item_id`, menuID).Scan(&menuItemID)

	if err != nil {
		log.Err(err)
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
	utils.CleanUp(postgresContainer)
}
