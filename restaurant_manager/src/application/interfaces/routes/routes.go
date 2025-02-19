package routes

import (
	"restaurant_manager/src/application/interfaces/handlers"

	"github.com/gorilla/mux"
)

func SetupRoutes(userHandler *handlers.UserHandler, restaurantHandler *handlers.RestaurantHandler, menuHandler *handlers.MenuHandler) *mux.Router {
	r := mux.NewRouter()

	r.HandleFunc("/register", userHandler.RegisterUser).Methods("POST")
	r.HandleFunc("/login", userHandler.LoginUser).Methods("POST")
	r.HandleFunc("/restaurants", restaurantHandler.CreateRestaurant).Methods("POST")
	r.HandleFunc("/restaurants/{restaurant_id}", restaurantHandler.GetRestaurant).Methods("GET")
	r.HandleFunc("/restaurants/{restaurant_id}", restaurantHandler.UpdateRestaurant).Methods("PUT")
	r.HandleFunc("/restaurants/{restaurant_id}", restaurantHandler.DeleteRestaurant).Methods("DELETE")
	r.HandleFunc("/menus", menuHandler.CreateMenu).Methods("POST")
	r.HandleFunc("/menus/{menu_id}", menuHandler.DeleteMenu).Methods("DELETE")
	r.HandleFunc("/menus/{menu_id}/items", menuHandler.AddMenuItem).Methods("POST")
	r.HandleFunc("/menu-items/{menu_item_id}", menuHandler.UpdateMenuItem).Methods("PUT")
	r.HandleFunc("/menu-items/{menu_item_id}", menuHandler.DeleteMenuItem).Methods("DELETE")
	return r
}
