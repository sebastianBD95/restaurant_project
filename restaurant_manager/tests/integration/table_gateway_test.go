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

func TestAddTable(t *testing.T) {
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

	TableData := map[string]string{"restaurant_id": restaurantID, "table_number": "2", "qr_code": "QR_CODE_URL_2"}

	TableJSON, _ := json.Marshal(TableData)

	req, _ := http.NewRequest("POST", "/tables", bytes.NewBuffer(TableJSON))
	req.Header.Set("Content-Type", "application/json")

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["table_id"])
	utils.CleanUp(postgresContainer)
}

func TestDeleteTable(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID, tableID string

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
	connStr := fmt.Sprintf("/tables/%s", tableID)
	req, _ := http.NewRequest("DELETE", connStr, nil)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusNoContent, response.Code)

	utils.CleanUp(postgresContainer)
}

func TestGetTable(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID, tableID string

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
	connStr := fmt.Sprintf("/tables/%s", tableID)
	req, _ := http.NewRequest("GET", connStr, nil)

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	assert.NotEmpty(t, responseBody["table_id"])
	utils.CleanUp(postgresContainer)
}

func TestUpdateTable(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	var userID, restaurantID, tableID string

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

	connStr := fmt.Sprintf("/tables/%s", tableID)

	tableData := map[string]string{"table_id": tableID, "restaurant_id": restaurantID, "table_number": "3", "qr_code": "QR_CODE_URL_3"}
	tableJSON, _ := json.Marshal(tableData)
	req, _ := http.NewRequest("PUT", connStr, bytes.NewBuffer(tableJSON))

	response := mock.ExecuteRequest(req, router)
	assert.Equal(t, http.StatusOK, response.Code)

	utils.CleanUp(postgresContainer)
}
