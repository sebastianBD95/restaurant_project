package repositories

import (
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"

	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type OrderRepositoryImpl struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) repositories.OrderRepository {
	return &OrderRepositoryImpl{db}
}

func (repo *OrderRepositoryImpl) CreateOrder(order *models.Order) (string, error) {
	result := repo.db.Clauses(clause.Returning{}).Omit("order_id").Create(&order)
	if result.Error != nil {
		return "", result.Error
	}
	return order.OrderID, nil
}

func (repo *OrderRepositoryImpl) DeleteOrder(orderID string) error {
	return repo.db.Delete(&models.Order{}, "order_id = ?", orderID).Error
}

func (repo *OrderRepositoryImpl) UpdateOrder(order *models.Order) error {
	return repo.db.Model(&models.Order{}).Where("order_id = ?", order.OrderID).Updates(order).Error
}

func (repo *OrderRepositoryImpl) GetOrder(orderID string) (*models.Order, error) {
	var orders models.Order
	err := repo.db.Model(&models.Order{}).
		Preload("OrderItems").Where("order_id = ?", orderID).
		First(&orders).Error

	if err != nil {
		return nil, err
	}
	return &orders, nil
}

func (repo *OrderRepositoryImpl) GetOrderByRestaurantID(restaurantID string) ([]models.Order, error) {
	var orders []models.Order
	err := repo.db.Model(&models.Order{}).
		Preload("OrderItems").Preload("OrderItems.MenuItem").
		Preload("Table").Where("restaurant_id = ?", restaurantID).
		Find(&orders).Error

	if err != nil {
		return nil, err
	}
	return orders, nil
}

func (repo *OrderRepositoryImpl) AddOrderItem(orderItem *models.OrderItem) (string, error) {
	result := repo.db.Create(orderItem)
	if result.Error != nil {
		return "", result.Error
	}
	return orderItem.OrderID, nil
}

func (repo *OrderRepositoryImpl) UpdateOrderItem(orderItem *models.OrderItem) error {
	return repo.db.Model(&models.OrderItem{}).
		Where("order_id = ? AND menu_item_id = ?", orderItem.OrderID, orderItem.MenuItemID).
		Updates(orderItem).Error
}

func (repo *OrderRepositoryImpl) DeleteOrderItem(orderItemID string) error {
	return repo.db.Delete(&models.OrderItem{}, "order_id = ?", orderItemID).Error
}

func (repo *OrderRepositoryImpl) GetOrderItems(orderID string) ([]models.OrderItem, error) {
	var items []models.OrderItem
	err := repo.db.Where("order_id = ?", orderID).Find(&items).Error
	return items, err
}

func (repo *OrderRepositoryImpl) WithTransaction(fn func(txRepo repositories.OrderRepository) error) error {
	return repo.db.Transaction(func(tx *gorm.DB) error {
		txRepo := &OrderRepositoryImpl{db: tx}
		return fn(txRepo)
	})
}
