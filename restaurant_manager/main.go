package main

import (
	"fmt"
	"log"
	"net/http"
	"restaurant_manager/src/application/infrastructure/repositories"
	"restaurant_manager/src/application/interfaces/handlers"
	"restaurant_manager/src/application/interfaces/routes"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/config"
)

func main() {
	config.ConnectDB()
	defer config.DB.Close()

	userRepo := repositories.NewUserRepository(config.DB)
	restaurantRepo := repositories.NewRestaurantRepository(config.DB)
	menuRepo := repositories.NewMenuRepository(config.DB)
	orderRepo := repositories.NewOrderRepository(config.DB)
	tableRepo := repositories.NewTableRepository(config.DB)

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

	r := routes.SetupRoutes(userHandler, restaurantHandler, menuHandler, orderHandler, tableHandler)

	fmt.Println("🚀 Server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
