package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"github.com/jmoiron/sqlx"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"net/http"
	"restaurant_manager/tests/integration/utils"
	"testing"
)

func TestAddMenu(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID string

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

	menuData := map[string]string{
		"restaurant_id": restaurantID,
		"name":          "Lunch menu",
	}

	menuJSON, _ := json.Marshal(menuData)

	req, _ := http.NewRequest("POST", "/menus", bytes.NewBuffer(menuJSON))
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["menu_id"])
	utils.CleanUp(postgresContainer)
}

func TestDeleteMenu(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID, menuID string

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

	err = testDB.QueryRow(`INSERT INTO servu.menus (restaurant_id, name)
	VALUES ($1, 'Lunch menu') 
	RETURNING restaurant_id`, restaurantID).Scan(&menuID)

	if err != nil {
		log.Err(err)
	}
	connStr := fmt.Sprintf("/menus/%s", menuID)
	req, _ := http.NewRequest("DELETE", connStr, nil)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusNoContent, response.Code)

	utils.CleanUp(postgresContainer)
}

func TestAddMenuItem(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID, menuID string

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

	err = testDB.QueryRow(`INSERT INTO servu.menus (restaurant_id, name)
	VALUES ($1, 'Lunch menu') 
	RETURNING menu_id`, restaurantID).Scan(&menuID)

	if err != nil {
		log.Err(err)
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
	utils.CleanUp(postgresContainer)
}

func TestDeleteMenuItem(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID, menuID, menuItemID string

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

	connStr := fmt.Sprintf("/menu-items/%s", menuItemID)
	req, _ := http.NewRequest("DELETE", connStr, nil)
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusNoContent, response.Code)
	utils.CleanUp(postgresContainer)
}
