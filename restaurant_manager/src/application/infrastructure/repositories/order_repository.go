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
		Preload("OrderItems").Preload("OrderItems.MenuItem").
		Preload("Table").
		Where("order_id = ?", orderID).
		First(&orders).Error

	if err != nil {
		return nil, err
	}
	return &orders, nil
}

func (repo *OrderRepositoryImpl) GetOrderByRestaurantID(restaurantID string, status string, tableID string, startDate string, endDate string) ([]models.Order, error) {
	// Input validation
	if restaurantID == "" {
		return nil, gorm.ErrInvalidData
	}
	if status == "" {
		return nil, gorm.ErrInvalidData
	}

	var orders []models.Order

	// Build query with conditional table filter
	query := repo.db.Model(&models.Order{}).
		Preload("OrderItems").
		Preload("OrderItems.MenuItem").
		Preload("Table").
		Where("restaurant_id = ? AND status = ?", restaurantID, status)

	// Add table filter only if tableID is provided
	if tableID != "" {
		query = query.Where("table_id = ?", tableID)
	}

	// Add date filter only if startDate and endDate are provided
	if startDate != "" && endDate != "" {
		query = query.Where("created_at BETWEEN ? AND ?", startDate, endDate)
	}

	// Execute query with ordering for consistent results
	err := query.Order("created_at DESC").Find(&orders).Error
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
		Where("order_id = ? AND menu_item_id = ? AND observation = ?", orderItem.OrderID, orderItem.MenuItemID, orderItem.Observation).
		Updates(orderItem).Error
}

func (repo *OrderRepositoryImpl) DeleteOrderItem(orderID string, menuItemID string) error {
	return repo.db.Delete(&models.OrderItem{}, "order_id = ? AND menu_item_id = ?", orderID, menuItemID).Error
}

func (repo *OrderRepositoryImpl) GetOrderItems(orderID string) ([]models.OrderItem, error) {
	var items []models.OrderItem
	err := repo.db.Where("order_id = ?", orderID).Find(&items).Error
	return items, err
}

func (repo *OrderRepositoryImpl) GetOrderItem(orderID string, menuItemID string, observation string) (*models.OrderItem, error) {
	var item models.OrderItem
	err := repo.db.Where("order_id = ? AND menu_item_id = ? AND observation = ?", orderID, menuItemID, observation).First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}

func (repo *OrderRepositoryImpl) WithTransaction(fn func(txRepo repositories.OrderRepository) error) error {
	return repo.db.Transaction(func(tx *gorm.DB) error {
		txRepo := &OrderRepositoryImpl{db: tx}
		return fn(txRepo)
	})
}

func (repo *OrderRepositoryImpl) AddVoidOrderItem(voidOrderItem *models.VoidOrderItem) error {
	return repo.db.Clauses(clause.Returning{}).Omit("void_order_item_id").Create(voidOrderItem).Error
}

func (repo *OrderRepositoryImpl) GetVoidOrderItems(restaurantID string) ([]models.VoidOrderItem, error) {
	var items []models.VoidOrderItem
	err := repo.db.Preload("MenuItem").
		Where("restaurant_id = ?", restaurantID).
		Find(&items).Error
	return items, err
}

func (repo *OrderRepositoryImpl) DeleteVoidOrderItem(voidOrderItemID string) error {
	return repo.db.Delete(&models.VoidOrderItem{}, "void_order_item_id = ?", voidOrderItemID).Error
}

func (repo *OrderRepositoryImpl) GetVoidOrderItemByID(voidOrderItemID string) (*models.VoidOrderItem, error) {
	var item models.VoidOrderItem
	err := repo.db.Preload("MenuItem").
		Where("void_order_item_id = ?", voidOrderItemID).
		First(&item).Error
	if err != nil {
		return nil, err
	}
	return &item, nil
}
