package main

import (
	"fmt"
	"log"
	"net/http"
	"restaurant_manager/application/infrastructure/repositories"
	"restaurant_manager/application/interfaces/handlers"
	"restaurant_manager/application/interfaces/routes"
	"restaurant_manager/application/services"
	"restaurant_manager/config"
)

func main() {
	config.ConnectDB()
	defer config.DB.Close()

	userRepo := repositories.NewUserRepository(config.DB)
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	r := routes.SetupRoutes(userHandler)

	fmt.Println("🚀 Server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
