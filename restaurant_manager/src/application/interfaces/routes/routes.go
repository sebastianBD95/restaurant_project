package routes

import (
	"log"
	"net/http"
	"restaurant_manager/src/application/interfaces/handlers"
	"time"

	"github.com/gorilla/mux"
)

// Custom logging middleware to log request method, URL, and headers
func logRequests(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Log method, URL, and headers of the incoming request
		log.Printf("[%s] %s %s", time.Now().Format(time.RFC3339), r.Method, r.URL.Path)

		// Log headers
		for name, values := range r.Header {
			for _, value := range values {
				log.Printf("%s: %s", name, value)
			}
		}

		// Continue to the next handler
		next.ServeHTTP(w, r)
	})
}

func accessControlMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET,POST,OPTIONS,PUT,DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Authorization")

		if r.Method == "OPTIONS" {
			return
		}

		next.ServeHTTP(w, r)
	})
}

func SetupRoutes(userHandler *handlers.UserHandler,
	restaurantHandler *handlers.RestaurantHandler,
	menuHandler *handlers.MenuHandler,
	orderHandler *handlers.OrderHandler,
	tableHandler *handlers.TableHandler,
	inventoryHandler *handlers.InventoryHandler,
	ingredientHandler *handlers.IngredientHandler,
	rawIngredientsHandler *handlers.RawIngredientsHandler,
	cashClosingHandler *handlers.CashClosingHandler) *mux.Router {

	r := mux.NewRouter()

	//r.Use(logRequests)
	r.Use(accessControlMiddleware)

	r.HandleFunc("/register", userHandler.RegisterUser).Methods("POST", "OPTIONS")
	r.HandleFunc("/login", userHandler.LoginUser).Methods("POST", "OPTIONS")
	r.HandleFunc("/users", userHandler.GetUsersByRestaurantID).Methods("GET", "OPTIONS")
	r.HandleFunc("/users", userHandler.UpdateUser).Methods("PUT", "OPTIONS")
	r.HandleFunc("/users", userHandler.DeleteUser).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/restaurants", restaurantHandler.CreateRestaurant).Methods("POST", "OPTIONS")
	r.HandleFunc("/restaurants", restaurantHandler.GetAllRestaurant).Methods("GET", "OPTIONS")
	r.HandleFunc("/restaurants/{restaurant_id}", restaurantHandler.UpdateRestaurant).Methods("PUT", "OPTIONS")
	r.HandleFunc("/restaurants/{restaurant_id}", restaurantHandler.DeleteRestaurant).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/menus/{restaurant_id}/items", menuHandler.AddMenuItem).Methods("POST", "OPTIONS")
	r.HandleFunc("/menus/{restaurant_id}/items", menuHandler.GetAllMenuItems).Methods("GET", "OPTIONS")
	r.HandleFunc("/menus/{restaurant_id}/items/{menu_item_id}", menuHandler.UpdateMenuItem).Methods("PUT", "OPTIONS")
	r.HandleFunc("/menus/{restaurant_id}/items/{menu_item_id}", menuHandler.DeleteMenuItem).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/orders", orderHandler.CreateOrder).Methods("POST", "OPTIONS")
	r.HandleFunc("/orders", orderHandler.UpdateOrder).Methods("PUT", "OPTIONS")
	r.HandleFunc("/orders", orderHandler.GetOrderByRestaurantID).Methods("GET", "OPTIONS")
	r.HandleFunc("/orders/{orders_id}", orderHandler.GetOrder).Methods("GET", "OPTIONS")
	r.HandleFunc("/orders/{orders_id}", orderHandler.DeleteOrder).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/orders/{order_id}/items", orderHandler.AddOrderItem).Methods("POST", "OPTIONS")
	r.HandleFunc("/orders/{order_id}/items/{menu_item_id}", orderHandler.UpdateOrderItem).Methods("PUT", "OPTIONS")
	r.HandleFunc("/orders/{order_id}/items/{menu_item_id}", orderHandler.DeleteOrderItem).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/orders/{order_id}/items", orderHandler.GetOrderItems).Methods("GET", "OPTIONS")
	r.HandleFunc("/orders/{order_id}/items/{menu_item_id}/void", orderHandler.CreateVoidOrderItem).Methods("POST", "OPTIONS")
	r.HandleFunc("/restaurants/{restaurant_id}/order-items/void", orderHandler.GetVoidOrderItems).Methods("GET", "OPTIONS")
	r.HandleFunc("/tables", tableHandler.CreateTable).Methods("POST", "OPTIONS")
	r.HandleFunc("/tables/{table_id}", tableHandler.GetTable).Methods("GET", "OPTIONS")
	r.HandleFunc("/tables", tableHandler.GetTablesByRestaurantId).Methods("GET", "OPTIONS")
	r.HandleFunc("/tables/{table_id}", tableHandler.UpdateTable).Methods("PUT", "OPTIONS")
	r.HandleFunc("/tables/{table_id}", tableHandler.DeleteTable).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/inventory", inventoryHandler.CreateInventory).Methods("POST", "OPTIONS")
	r.HandleFunc("/inventory", inventoryHandler.GetInventoryByRestaurantID).Methods("GET", "OPTIONS")
	r.HandleFunc("/inventory", inventoryHandler.UpdateInventory).Methods("PUT", "OPTIONS")
	r.HandleFunc("/ingredients", ingredientHandler.GetIngredientsByRestaurantID).Methods("GET", "OPTIONS")
	r.HandleFunc("/raw-ingredients", rawIngredientsHandler.GetByCategory).Methods("GET", "OPTIONS")
	r.HandleFunc("/raw-ingredients/upload", rawIngredientsHandler.UploadRawIngredientsCSV).Methods("POST", "OPTIONS")
	r.HandleFunc("/raw-ingredients", rawIngredientsHandler.UpdateRawIngredients).Methods("PUT", "OPTIONS")
	r.HandleFunc("/raw-ingredients/{raw_ingredient_id}", rawIngredientsHandler.DeleteRawIngredients).Methods("DELETE", "OPTIONS")

	// Cash Closing routes
	r.HandleFunc("/cash-closings", cashClosingHandler.CreateCashClosing).Methods("POST", "OPTIONS")
	r.HandleFunc("/cash-closings/data", cashClosingHandler.GetCashClosingData).Methods("GET", "OPTIONS")
	r.HandleFunc("/cash-closings/history", cashClosingHandler.GetCashClosingHistory).Methods("GET", "OPTIONS")
	r.HandleFunc("/cash-closings/{id}", cashClosingHandler.UpdateCashClosing).Methods("PUT", "OPTIONS")
	r.HandleFunc("/cash-closings/{id}", cashClosingHandler.DeleteCashClosing).Methods("DELETE", "OPTIONS")
	r.HandleFunc("/cash-closings/stats", cashClosingHandler.GetCashClosingStats).Methods("GET", "OPTIONS")
	return r
}
