package integration

import (
	"bytes"
	"encoding/json"
	"net/http"
	"restaurant_manager/tests/integration/utils"
	"testing"

	_ "github.com/lib/pq"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/schema"
)

func TestRegistryUser(t *testing.T) {
	postgresContainer, _ := utils.SetUp()
	testDB, err := gorm.Open(postgres.Open("postgres://postgres:postgres@localhost:5434/servu?sslmode=disable"), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix: "servu.",
		},
	})
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	// Mock user data
	userData := map[string]string{
		"name":         "John Doe",
		"email":        "john@example.com",
		"password":     "securepass",
		"role":         "admin",
		"id_number":    "1234567890",
		"phone":        "1234567890",
		"company_name": "Company Name",
		"nit_number":   "1234567890",
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
	postgresContainer, _ := utils.SetUp()
	testDB, err := gorm.Open(postgres.Open("postgres://postgres:postgres@localhost:5434/servu?sslmode=disable"), &gorm.Config{
		NamingStrategy: schema.NamingStrategy{
			TablePrefix: "servu.",
		},
	})
	mock := utils.NewMock(testDB)
	if err != nil {
		log.Err(err)
	}
	router := mock.SetRoutes()

	result := testDB.Exec(`INSERT INTO servu.users (name, email, password_hash, role, phone)
		VALUES ('John Doe', 'john@example.com', '$2a$10$fkLipV6Vn8KKo2uXK9JC8eA6dQFjW2RiHRJvmJP5LS3mNv1byZnqm', 'admin', '1234567890')`)
	assert.Nil(t, result.Error)

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
	utils.CleanUp(postgresContainer)
}
