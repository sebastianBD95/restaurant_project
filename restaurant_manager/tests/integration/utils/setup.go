package utils

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"restaurant_manager/src/application/infrastructure/repositories"
	"restaurant_manager/src/application/interfaces/handlers"
	"restaurant_manager/src/application/interfaces/routes"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/application/utils"
	"restaurant_manager/src/config"
	infraports "restaurant_manager/tests/integration/infrastructure/ports"
	"testing"

	"github.com/gorilla/mux"
	"github.com/testcontainers/testcontainers-go"
	"gorm.io/gorm"
)

type MockImpl struct {
	Db *gorm.DB
}

func NewMock(t *testing.T) *MockImpl {
	os.Setenv("APP_ENV", "test")
	// Load config
	cfg := config.LoadConfig()
	config.ConnectDB(cfg)
	utils.SetJWT(cfg)
	return &MockImpl{Db: config.DB}
}

func (m MockImpl) SetRoutes(localstackContainer testcontainers.Container) *mux.Router {

	// Repositories
	userRepo := repositories.NewUserRepository(config.DB)
	restaurantRepo := repositories.NewRestaurantRepository(config.DB)
	menuRepo := repositories.NewMenuRepository(config.DB)
	orderRepo := repositories.NewOrderRepository(config.DB)
	tableRepo := repositories.NewTableRepository(config.DB)
	inventoryRepo := repositories.NewInventoryRepository(config.DB)
	ingredientRepo := repositories.NewIngredientRepository(config.DB)
	rawIngredientRepo := repositories.NewRawIngredientsRepository(config.DB)

	s3Manager := infraports.InitLocalstackS3(localstackContainer)

	// Services
	userService := services.NewUserService(userRepo)
	ingredientService := services.NewIngredientsService(ingredientRepo)
	menuService := services.NewMenuService(menuRepo, &s3Manager, ingredientService)
	tableService := services.NewTableService(tableRepo)
	inventoryService := services.NewInventoryService(inventoryRepo, menuService)
	restaurantService := services.NewRestaurantService(restaurantRepo, &s3Manager)
	orderService := services.NewOrderService(orderRepo, tableService, menuService, inventoryService)
	rawIngredientsService := services.NewRawIngredientsService(rawIngredientRepo)

	// Handlers
	userHandler := handlers.NewUserHandler(userService)
	restaurantHandler := handlers.NewRestaurantHandler(restaurantService)
	menuHandler := handlers.NewMenuHandler(menuService)
	orderHandler := handlers.NewOrderHandler(orderService)
	tableHandler := handlers.NewTableHandler(tableService)
	inventoryHandler := handlers.NewInventoryHandler(inventoryService)
	ingredientHandler := handlers.NewIngredientHandler(ingredientService)
	rawIngredientsHandler := handlers.NewRawIngredientsHandler(rawIngredientsService)

	// Setup routes
	router := routes.SetupRoutes(
		userHandler,
		restaurantHandler,
		menuHandler,
		orderHandler,
		tableHandler,
		inventoryHandler,
		ingredientHandler,
		rawIngredientsHandler,
	)
	return router
}

func (m MockImpl) ExecuteRequest(req *http.Request, router http.Handler) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	return rr
}

func (s MockImpl) TestMain(m *testing.M) {
	m.Run()
}

// LoginAndGetToken logs in and returns the JWT token for the given credentials.
func LoginAndGetToken(t *testing.T, router http.Handler, email, password string) string {
	loginData := map[string]string{
		"email":    email,
		"password": password,
	}
	loginJSON, _ := json.Marshal(loginData)
	req, _ := http.NewRequest("POST", "/login", bytes.NewBuffer(loginJSON))
	req.Header.Set("Content-Type", "application/json")
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("Login failed: expected 200, got %d", rr.Code)
	}
	var resp map[string]interface{}
	json.Unmarshal(rr.Body.Bytes(), &resp)
	token, ok := resp["token"].(string)
	if !ok {
		t.Fatalf("No token in login response")
	}
	return token
}
