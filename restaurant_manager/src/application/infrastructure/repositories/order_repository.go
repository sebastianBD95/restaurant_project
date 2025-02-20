package repositories

import (
	"github.com/jmoiron/sqlx"
	"restaurant_manager/src/domain/models"
	"restaurant_manager/src/domain/repositories"
)

type OrderRepositoryImpl struct {
	db *sqlx.DB
}

func NewOrderRepository(db *sqlx.DB) repositories.OrderRepository {
	return &OrderRepositoryImpl{db}
}

func (repo OrderRepositoryImpl) CreateOrder(order *models.Order) (string, error) {
	query := `INSERT INTO servu.orders (table_id,status,total_price) values ($1,$2,$3) RETURNING order_id`
	var orderID string
	err := repo.db.QueryRow(query, order.TableID, order.Status, order.TotalPrice).Scan(&orderID)
	return orderID, err
}

func (repo OrderRepositoryImpl) DeleteOrder(orderID string) error {
	query := `DELETE FROM servu.orders WHERE order_id = $1`
	err := repo.db.QueryRow(query, orderID).Scan(&orderID)
	return err
}

func (repo OrderRepositoryImpl) UpdateOrder(order *models.Order) error {
	query := `UPDATE servu.orders SET table_id=$1, status=$2, total_price=$3 WHERE order_id = $1`
	var orderID string
	err := repo.db.QueryRow(query, order.TableID, order.Status, order.TotalPrice).Scan(&orderID)
	return err
}

func (repo OrderRepositoryImpl) GetOrder(orderID string) (*models.Order, error) {
	query := `SELECT * FROM servu.orders WHERE order_id = $1`
	var order *models.Order
	err := repo.db.Get(&order, query, orderID)
	return order, err
}
