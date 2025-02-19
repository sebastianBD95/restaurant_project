package integration

import (
	"bytes"
	"context"
	"encoding/json"
	"github.com/jmoiron/sqlx"
	_ "github.com/lib/pq"
	"github.com/rs/zerolog/log"
	"github.com/stretchr/testify/assert"
	"github.com/testcontainers/testcontainers-go"
	"net/http"
	"net/http/httptest"
	"restaurant_manager/src/application/infrastructure/repositories"
	"restaurant_manager/src/application/interfaces/handlers"
	"restaurant_manager/src/application/interfaces/routes"
	"restaurant_manager/src/application/services"
	"restaurant_manager/tests/integration/utils"
	"testing"
)

var testDB *sqlx.DB

func SetUp() (testcontainers.Container, testcontainers.Container) {
	postgresContainer, postgresIp, _ := utils.PostgresContainer()
	flyContainer, _ := utils.FlyWayContainer(postgresIp)

	return postgresContainer, flyContainer
}
func CleanUp(container testcontainers.Container) {
	ctx := context.Background()
	container.Terminate(ctx)

}

func executeRequest(req *http.Request, router http.Handler) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	return rr
}

func TestMain(m *testing.M) {
	m.Run()
}

func TestRegistryUser(t *testing.T) {
	postgresContainer, _ := SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	if err != nil {
		log.Err(err)
	}
	userRepo := repositories.NewUserRepository(testDB)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	router := routes.SetupRoutes(userHandler)

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
	response := executeRequest(req, router)

	// Validate response
	assert.Equal(t, http.StatusCreated, response.Code)

	// Parse response body
	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	// Check if user_id is returned
	assert.NotEmpty(t, responseBody["user_id"])
	CleanUp(postgresContainer)
}

func TestLoginUser(t *testing.T) {
	postgres, _ := SetUp()
	testDB, err := sqlx.Connect("postgres", "postgres://postgres:postgres@localhost:5434/servu?sslmode=disable")
	if err != nil {
		log.Err(err)
	}
	userRepo := repositories.NewUserRepository(testDB)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	router := routes.SetupRoutes(userHandler)

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
	response := executeRequest(req, router)

	// Validate response
	assert.Equal(t, http.StatusOK, response.Code)

	// Parse response body
	var responseBody map[string]string
	json.Unmarshal(response.Body.Bytes(), &responseBody)

	// Check if login message is correct
	assert.Equal(t, "Login successful", responseBody["message"])
	CleanUp(postgres)
}
