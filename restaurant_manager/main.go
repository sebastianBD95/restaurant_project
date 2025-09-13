package main

import (
	"fmt"
	"log"
	"net/http"
	"restaurant_manager/src/application/infrastructure/ports"
	"restaurant_manager/src/application/infrastructure/repositories"
	"restaurant_manager/src/application/interfaces/handlers"
	"restaurant_manager/src/application/interfaces/routes"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/application/utils"
	"restaurant_manager/src/config"
)

func main() {
	cfg := config.LoadConfig()
	config.ConnectDB(cfg)
	utils.SetJWT(cfg)
	aws3 := ports.InitS3(cfg)

	userRepo := repositories.NewUserRepository(config.DB)
	restaurantRepo := repositories.NewRestaurantRepository(config.DB)
	menuRepo := repositories.NewMenuRepository(config.DB)
	orderRepo := repositories.NewOrderRepository(config.DB)
	tableRepo := repositories.NewTableRepository(config.DB)
	inventoryRepo := repositories.NewInventoryRepository(config.DB)
	ingredientRepo := repositories.NewIngredientRepository(config.DB)
	rawIngredientRepo := repositories.NewRawIngredientsRepository(config.DB)
	cashClosingRepo := repositories.NewCashClosingRepository(config.DB)

	ingredientService := services.NewIngredientsService(ingredientRepo)
	userService := services.NewUserService(userRepo)
	restaurantService := services.NewRestaurantService(restaurantRepo, &aws3)
	menuService := services.NewMenuService(menuRepo, &aws3, ingredientService)
	tableService := services.NewTableService(tableRepo, cfg.RestaurantManager.QRTemplate)
	inventoryService := services.NewInventoryService(inventoryRepo, menuService)
	orderService := services.NewOrderService(orderRepo, tableService, menuService, inventoryService)
	rawIngredientService := services.NewRawIngredientsService(rawIngredientRepo)
	cashClosingService := services.NewCashClosingService(cashClosingRepo, orderRepo, menuRepo)

	userHandler := handlers.NewUserHandler(userService)
	restaurantHandler := handlers.NewRestaurantHandler(restaurantService)
	menuHandler := handlers.NewMenuHandler(menuService)
	orderHandler := handlers.NewOrderHandler(orderService)
	tableHandler := handlers.NewTableHandler(tableService)
	inventoryHandler := handlers.NewInventoryHandler(inventoryService)
	ingredientHandler := handlers.NewIngredientHandler(ingredientService)
	rawIngredientsHandler := handlers.NewRawIngredientsHandler(rawIngredientService)
	cashClosingHandler := handlers.NewCashClosingHandler(cashClosingService)

	r := routes.SetupRoutes(
		userHandler,
		restaurantHandler,
		menuHandler,
		orderHandler,
		tableHandler,
		inventoryHandler,
		ingredientHandler,
		rawIngredientsHandler,
		cashClosingHandler)

	fmt.Println("🚀 Server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
