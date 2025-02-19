package integration

import (
	"bytes"
	"encoding/json"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"net/http"
	"restaurant_manager/tests/integration/utils"
	"testing"
)

func TestRegistryUser(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	// Mock user data
	userData := map[string]string{
		"name":     "John Doe",
		"email":    "john@example.com",
		"password": "securepass",
		"role":     "admin",
	}
	userJSON, _ := json.Marshal(userData)
	req, _ := http.NewRequest("POST", "/register", bytes.NewBuffer(userJSON))
	req.Header.Set("Content-Type", "application/json")
	// Execute request
	response := mock.ExecuteRequest(req, router)

	// Validate response
	assert.Equal(t, http.StatusCreated, response.Code)

	// Parse response body
	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	// Check if user_id is returned
	assert.NotEmpty(t, responseBody["user_id"])
	utils.CleanUp(postgresContainer)
}

func TestLoginUser(t *testing.T) {
	postgres, _ := utils.SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	_, err = testDB.Exec(`INSERT INTO servu.users (name, email, password_hash, role)
		VALUES ('John Doe', 'john@example.com', '$2a$10$fkLipV6Vn8KKo2uXK9JC8eA6dQFjW2RiHRJvmJP5LS3mNv1byZnqm', 'admin')`)
	assert.Nil(t, err)

	loginData := map[string]string{
		"email":    "john@example.com",
		"password": "securepass",
	}

	// Convert loginData to JSON
	loginJSON, _ := json.Marshal(loginData)

	// Create HTTP request
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(loginJSON))
	req.Header.Set("Content-Type", "application/json")

	// Execute request
	response := mock.ExecuteRequest(req, router)

	// Validate response
	assert.Equal(t, http.StatusOK, response.Code)

	// Parse response body
	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	// Check if login message is correct
	assert.Equal(t, "Login successful", responseBody["message"])
	utils.CleanUp(postgres)
}
