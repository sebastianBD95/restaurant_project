package utils

import (
	"net/http"
	"net/http/httptest"
	"restaurant_manager/src/application/infrastructure/repositories"
	"restaurant_manager/src/application/interfaces/handlers"
	"restaurant_manager/src/application/interfaces/routes"
	"restaurant_manager/src/application/services"
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
	userRepo := repositories.NewUserRepository(m.db)
	restaurantRepo := repositories.NewRestaurantRepository(m.db)
	menuRepo := repositories.NewMenuRepository(m.db)
	orderRepo := repositories.NewOrderRepository(m.db)
	tableRepo := repositories.NewTableRepository(m.db)

	userService := services.NewUserService(userRepo)
	restaurantService := services.NewRestaurantService(restaurantRepo)
	menuService := services.NewMenuService(menuRepo)
	orderService := services.NewOrderService(orderRepo)
	tableService := services.NewTableService(tableRepo)

	userHandler := handlers.NewUserHandler(userService)
	restaurantHandler := handlers.NewRestaurantHandler(restaurantService)
	menuHandler := handlers.NewMenuHandler(menuService)
	orderHandler := handlers.NewOrderHandler(orderService)
	tableHandler := handlers.NewTableHandler(tableService)

	router := routes.SetupRoutes(userHandler, restaurantHandler, menuHandler, orderHandler, tableHandler)
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
