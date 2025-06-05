package utils

import (
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
	"gorm.io/gorm"
)

type mockImpl struct {
	db *gorm.DB
}

func NewMock(db *gorm.DB) *mockImpl {
	return &mockImpl{db: db}
}

func (m mockImpl) SetRoutes() *mux.Router {
	os.Setenv("APP_ENV", "test")
	// Load config
	cfg := config.LoadConfig()
	config.ConnectDB(cfg)
	utils.SetJWT(cfg)
	// Repositories
	userRepo := repositories.NewUserRepository(m.db)
	restaurantRepo := repositories.NewRestaurantRepository(m.db)
	menuRepo := repositories.NewMenuRepository(m.db)
	orderRepo := repositories.NewOrderRepository(m.db)
	tableRepo := repositories.NewTableRepository(m.db)
	inventoryRepo := repositories.NewInventoryRepository(m.db)
	ingredientRepo := repositories.NewIngredientRepository(m.db)
	rawIngredientRepo := repositories.NewRawIngredientsRepository(m.db)

	// Use LocalStack S3 manager
	s3Manager := infraports.InitLocalstackS3()

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

func (m mockImpl) ExecuteRequest(req *http.Request, router http.Handler) *httptest.ResponseRecorder {
	rr := httptest.NewRecorder()
	router.ServeHTTP(rr, req)
	return rr
}

func (s mockImpl) TestMain(m *testing.M) {
	m.Run()
}
