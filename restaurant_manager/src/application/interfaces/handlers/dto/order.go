package dto

import "restaurant_manager/src/domain/models"

type OrderDTO struct {
	OrderID      string         `json:"order_id"`
	TableID      string         `json:"table_id"`
	RestaurantID string         `json:"restaurant_id"`
	Items        []OrderItemDTO `json:"items"`
	Status       string         `json:"status"`
	TotalPrice   float64        `json:"total_price"`
}

type OrderItemDTO struct {
	MenuItemID  string  `json:"menu_item_id"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
	Observation string  `json:"observation"`
}

func safeString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func FromOrders(orders []models.Order, orderItems []models.OrderItem) []OrderDTO {
	orderDTOs := make([]OrderDTO, len(orders))
	for i, order := range orders {
		var items []OrderItemDTO
		for _, item := range orderItems {
			if item.OrderID == order.OrderID {
				items = append(items, OrderItemDTO{
					MenuItemID:  item.MenuItemID,
					Quantity:    item.Quantity,
					Price:       item.Price,
					Observation: safeString(item.Observation),
				})
			}
		}
		orderDTOs[i] = OrderDTO{
			OrderID:      order.OrderID,
			TableID:      order.TableID,
			RestaurantID: order.RestaurantID,
			Items:        items,
			Status:       string(order.Status),
			TotalPrice:   order.TotalPrice,
		}
	}
	return orderDTOs
}
