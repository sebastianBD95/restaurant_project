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
	userService := services.NewUserService(userRepo)
	userHandler := handlers.NewUserHandler(userService)

	r := routes.SetupRoutes(userHandler)

	fmt.Println("🚀 Server running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", r))
}
