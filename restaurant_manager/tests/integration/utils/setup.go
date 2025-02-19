package utils

import (
	"github.com/gorilla/mux"
	"github.com/jmoiron/sqlx"
	"net/http"
	"net/http/httptest"
	"restaurant_manager/src/application/infrastructure/repositories"
	"restaurant_manager/src/application/interfaces/handlers"
	"restaurant_manager/src/application/interfaces/routes"
	"restaurant_manager/src/application/services"
	"testing"
)

type mockImpl struct {
	db *sqlx.DB
}

func NewMock(db *sqlx.DB) *mockImpl {
	return &mockImpl{db: db}
}

func (m mockImpl) SetRoutes() *mux.Router {
	userRepo := repositories.NewUserRepository(m.db)
	restaurantRepo := repositories.NewRestaurantRepository(m.db)
	menuRepo := repositories.NewMenuRepository(m.db)

	userService := services.NewUserService(userRepo)
	restaurantService := services.NewRestaurantService(restaurantRepo)
	menuService := services.NewMenuService(menuRepo)

	userHandler := handlers.NewUserHandler(userService)
	restaurantHandler := handlers.NewRestaurantHandler(restaurantService)
	menuHandler := handlers.NewMenuHandler(menuService)

	router := routes.SetupRoutes(userHandler, restaurantHandler, menuHandler)
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
