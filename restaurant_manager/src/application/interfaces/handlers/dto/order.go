package dto

import (
	"restaurant_manager/src/domain/models"
	"time"
)

type OrderDTO struct {
	OrderID       string         `json:"order_id"`
	TableID       string         `json:"table_id"`
	Table         int            `json:"table"`
	RestaurantID  string         `json:"restaurant_id"`
	Items         []OrderItemDTO `json:"items"`
	Status        string         `json:"status"`
	TotalPrice    float64        `json:"total_price"`
	TimeToPrepare float64        `json:"time_to_prepare"`
	TimeToDeliver float64        `json:"time_to_deliver"`
	TimeToPay     float64        `json:"time_to_pay"`
	CreatedAt     time.Time      `json:"created_at"`
}

type OrderItemDTO struct {
	MenuItemID  string  `json:"menu_item_id"`
	Name        string  `json:"name"`
	Quantity    int     `json:"quantity"`
	Price       float64 `json:"price"`
	Status      string  `json:"status"`
	Observation string  `json:"observation"`
	Image       string  `json:"image"`
}

type RecoverVoidOrderItemDTO struct {
	TargetOrderID string `json:"target_order_id"`
}

func safeString(s *string) string {
	if s == nil {
		return ""
	}
	return *s
}

func FromOrders(orders []models.Order) []OrderDTO {
	orderDTOs := make([]OrderDTO, len(orders))
	for i, order := range orders {
		orderDTOs[i] = OrderDTO{
			OrderID:       order.OrderID,
			TableID:       order.Table.TableID,
			Table:         order.Table.TableNumber,
			RestaurantID:  order.RestaurantID,
			Status:        string(order.Status),
			TotalPrice:    order.TotalPrice,
			Items:         FromOrderItems(order.OrderItems),
			CreatedAt:     order.CreatedAt,
			TimeToPrepare: order.TimeToPrepare,
			TimeToDeliver: order.TimeToDeliver,
			TimeToPay:     order.TimeToPay,
		}
	}
	return orderDTOs
}

func FromOrderItems(orderItems []models.OrderItem) []OrderItemDTO {
	orderItemDTOs := make([]OrderItemDTO, len(orderItems))
	for i, orderItem := range orderItems {
		orderItemDTOs[i] = OrderItemDTO{
			MenuItemID:  orderItem.MenuItemID,
			Name:        orderItem.MenuItem.Name,
			Quantity:    orderItem.Quantity,
			Price:       orderItem.Price,
			Status:      string(orderItem.Status),
			Observation: safeString(orderItem.Observation),
			Image:       orderItem.MenuItem.ImageURL,
		}
	}
	return orderItemDTOs
}

func FromVoidOrderItems(voidOrderItems []models.VoidOrderItem) []OrderItemDTO {
	orderItemDTOs := make([]OrderItemDTO, len(voidOrderItems))
	for i, voidOrderItem := range voidOrderItems {
		orderItemDTOs[i] = OrderItemDTO{
			MenuItemID:  voidOrderItem.MenuItemID,
			Name:        voidOrderItem.MenuItem.Name,
			Quantity:    voidOrderItem.Quantity,
			Price:       voidOrderItem.Price,
			Status:      string(voidOrderItem.Status),
			Observation: safeString(&voidOrderItem.VoidReason),
			Image:       voidOrderItem.MenuItem.ImageURL,
		}
	}
	return orderItemDTOs
}
