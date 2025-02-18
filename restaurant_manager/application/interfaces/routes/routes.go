package routes

import (
	"restaurant_manager/application/interfaces/handlers"

	"github.com/gorilla/mux"
)

func SetupRoutes(userHandler *handlers.UserHandler) *mux.Router {
	r := mux.NewRouter()

	r.HandleFunc("/register", userHandler.RegisterUser).Methods("POST")
	r.HandleFunc("/login", userHandler.LoginUser).Methods("POST")

	return r
}
