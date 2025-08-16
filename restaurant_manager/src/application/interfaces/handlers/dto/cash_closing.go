package dto

import "time"

type CashClosingRequest struct {
	ClosingDate       string  `json:"closing_date"`
	CashInRegister    float64 `json:"cash_in_register"`
	CashWithdrawn     float64 `json:"cash_withdrawn"`
	Notes             string  `json:"notes"`
	TotalSales        float64 `json:"total_sales"`
	TotalRevenue      float64 `json:"total_revenue"`
	TotalCosts        float64 `json:"total_costs"`
	TotalProfit       float64 `json:"total_profit"`
	OrderCount        int     `json:"order_count"`
	AverageOrderValue float64 `json:"average_order_value"`
}

type CashClosingResponse struct {
	CashClosingID     string    `json:"cash_closing_id"`
	RestaurantID      string    `json:"restaurant_id"`
	ClosingDate       string    `json:"closing_date"`
	CashInRegister    float64   `json:"cash_in_register"`
	CashWithdrawn     float64   `json:"cash_withdrawn"`
	Notes             string    `json:"notes"`
	TotalSales        float64   `json:"total_sales"`
	TotalRevenue      float64   `json:"total_revenue"`
	TotalCosts        float64   `json:"total_costs"`
	TotalProfit       float64   `json:"total_profit"`
	OrderCount        int       `json:"order_count"`
	AverageOrderValue float64   `json:"average_order_value"`
	CreatedAt         time.Time `json:"created_at"`
	UpdatedAt         time.Time `json:"updated_at"`
}

type CashClosingData struct {
	ClosingDate       string           `json:"closing_date"`
	TotalSales        float64          `json:"total_sales"`
	TotalRevenue      float64          `json:"total_revenue"`
	TotalCosts        float64          `json:"total_costs"`
	TotalProfit       float64          `json:"total_profit"`
	OrderCount        int              `json:"order_count"`
	AverageOrderValue float64          `json:"average_order_value"`
	TopSellingItems   []TopSellingItem `json:"top_selling_items"`
	PaymentMethods    []PaymentMethod  `json:"payment_methods"`
	CashInRegister    float64          `json:"cash_in_register"`
	CashWithdrawn     float64          `json:"cash_withdrawn"`
	Notes             string           `json:"notes"`
}

type TopSellingItem struct {
	Name     string  `json:"name"`
	Quantity int     `json:"quantity"`
	Revenue  float64 `json:"revenue"`
}

type PaymentMethod struct {
	Method string  `json:"method"`
	Amount float64 `json:"amount"`
	Count  int     `json:"count"`
}
