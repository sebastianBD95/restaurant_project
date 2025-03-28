package routes

import (
	"restaurant_manager/src/application/interfaces/handlers"

	"github.com/gorilla/mux"
)

func SetupRoutes(userHandler *handlers.UserHandler, restaurantHandler *handlers.RestaurantHandler, menuHandler *handlers.MenuHandler, orderHandler *handlers.OrderHandler, tableHandler *handlers.TableHandler) *mux.Router {
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
	r.HandleFunc("/orders", orderHandler.CreateOrder).Methods("POST")
	r.HandleFunc("/orders/{orders_id}", orderHandler.UpdateOrder).Methods("PUT")
	r.HandleFunc("/orders/{orders_id}", orderHandler.GetOrder).Methods("GET")
	r.HandleFunc("/orders/{orders_id}", orderHandler.DeleteOrder).Methods("DELETE")
	r.HandleFunc("/orders/{order_id}/items", orderHandler.AddOrderItem).Methods("POST")
	r.HandleFunc("/order-items/{order_item_id}", orderHandler.UpdateOrderItem).Methods("PUT")
	r.HandleFunc("/order-items/{order_item_id}", orderHandler.DeleteOrderItem).Methods("DELETE")
	r.HandleFunc("/orders/{order_id}/items", orderHandler.GetOrderItems).Methods("GET")
	r.HandleFunc("/tables", tableHandler.CreateTable).Methods("POST")
	r.HandleFunc("/tables/{table_id}", tableHandler.GetTable).Methods("GET")
	r.HandleFunc("/tables/{table_id}", tableHandler.UpdateTable).Methods("PUT")
	r.HandleFunc("/tables/{table_id}", tableHandler.DeleteTable).Methods("DELETE")
	return r
}
