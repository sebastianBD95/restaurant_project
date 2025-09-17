package handlers

import (
	"encoding/json"
	"net/http"
	"restaurant_manager/src/application/interfaces/handlers/dto"
	"restaurant_manager/src/application/services"
	"restaurant_manager/src/application/utils"
	"restaurant_manager/src/domain/models"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/mux"
)

type CashClosingHandler struct {
	service *services.CashClosingService
	limiter *services.FeatureLimiter
}

func NewCashClosingHandler(service *services.CashClosingService, limiter *services.FeatureLimiter) *CashClosingHandler {
	return &CashClosingHandler{service: service, limiter: limiter}
}

// CreateCashClosing handles POST /cash-closings
func (h *CashClosingHandler) CreateCashClosing(w http.ResponseWriter, r *http.Request) {
	owner := utils.TokenVerification(r, w)
	if owner == "" {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	var request dto.CashClosingRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Parse date
	closingDate, err := time.Parse("2006-01-02", request.ClosingDate)
	if err != nil {
		http.Error(w, "Invalid date format", http.StatusBadRequest)
		return
	}

	// Get restaurant_id from query params
	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "restaurant_id is required", http.StatusBadRequest)
		return
	}

	// Guard free-tier
	if h.limiter != nil && !h.limiter.CanCreateCashClosing(owner, restaurantID, closingDate) {
		http.Error(w, "Free tier limit: only 2 cash closings per month", http.StatusPaymentRequired)
		return
	}

	// Create cash closing model
	cashClosing := &models.CashClosing{
		CashClosingID:     uuid.New().String(),
		RestaurantID:      restaurantID,
		ClosingDate:       closingDate,
		CashInRegister:    request.CashInRegister,
		CashWithdrawn:     request.CashWithdrawn,
		Notes:             request.Notes,
		TotalSales:        request.TotalSales,
		TotalRevenue:      request.TotalRevenue,
		TotalCosts:        request.TotalCosts,
		TotalProfit:       request.TotalProfit,
		OrderCount:        request.OrderCount,
		AverageOrderValue: request.AverageOrderValue,
	}

	if err := h.service.CreateCashClosing(cashClosing); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to response DTO
	response := dto.CashClosingResponse{
		CashClosingID:     cashClosing.CashClosingID,
		RestaurantID:      cashClosing.RestaurantID,
		ClosingDate:       cashClosing.ClosingDate.Format("2006-01-02"),
		CashInRegister:    cashClosing.CashInRegister,
		CashWithdrawn:     cashClosing.CashWithdrawn,
		Notes:             cashClosing.Notes,
		TotalSales:        cashClosing.TotalSales,
		TotalRevenue:      cashClosing.TotalRevenue,
		TotalCosts:        cashClosing.TotalCosts,
		TotalProfit:       cashClosing.TotalProfit,
		OrderCount:        cashClosing.OrderCount,
		AverageOrderValue: cashClosing.AverageOrderValue,
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(response)
}

// GetCashClosingData handles GET /cash-closings/data
func (h *CashClosingHandler) GetCashClosingData(w http.ResponseWriter, r *http.Request) {
	_ = utils.TokenVerification(r, w)

	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "restaurant_id is required", http.StatusBadRequest)
		return
	}

	dateStr := r.URL.Query().Get("date")
	if dateStr == "" {
		http.Error(w, "date is required", http.StatusBadRequest)
		return
	}

	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		http.Error(w, "Invalid date format", http.StatusBadRequest)
		return
	}

	// Calculate cash closing data
	cashClosing, err := h.service.CalculateCashClosingData(restaurantID, date)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to response DTO
	response := dto.CashClosingData{
		ClosingDate:       cashClosing.ClosingDate.Format("2006-01-02"),
		TotalSales:        cashClosing.TotalSales,
		TotalRevenue:      cashClosing.TotalRevenue,
		TotalCosts:        cashClosing.TotalCosts,
		TotalProfit:       cashClosing.TotalProfit,
		OrderCount:        cashClosing.OrderCount,
		AverageOrderValue: cashClosing.AverageOrderValue,
		CashInRegister:    0,                      // Will be filled by form
		CashWithdrawn:     0,                      // Will be filled by form
		Notes:             "",                     // Will be filled by form
		TopSellingItems:   []dto.TopSellingItem{}, // TODO: Calculate from orders
		PaymentMethods:    []dto.PaymentMethod{},  // TODO: Calculate from payments
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetCashClosingHistory handles GET /cash-closings/history
func (h *CashClosingHandler) GetCashClosingHistory(w http.ResponseWriter, r *http.Request) {
	_ = utils.TokenVerification(r, w)

	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "restaurant_id is required", http.StatusBadRequest)
		return
	}

	startDateStr := r.URL.Query().Get("start_date")
	endDateStr := r.URL.Query().Get("end_date")

	var startDate, endDate time.Time
	var err error

	if startDateStr != "" {
		startDate, err = time.Parse("2006-01-02", startDateStr)
		if err != nil {
			http.Error(w, "Invalid start_date format", http.StatusBadRequest)
			return
		}
	} else {
		startDate = time.Now().AddDate(0, 0, -30) // Default to last 30 days
	}

	if endDateStr != "" {
		endDate, err = time.Parse("2006-01-02", endDateStr)
		if err != nil {
			http.Error(w, "Invalid end_date format", http.StatusBadRequest)
			return
		}
	} else {
		endDate = time.Now() // Default to today
	}

	cashClosings, err := h.service.GetCashClosingHistory(restaurantID, startDate, endDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	// Convert to response DTOs
	var responses []dto.CashClosingResponse
	for _, cc := range cashClosings {
		response := dto.CashClosingResponse{
			CashClosingID:     cc.CashClosingID,
			RestaurantID:      cc.RestaurantID,
			ClosingDate:       cc.ClosingDate.Format("2006-01-02"),
			CashInRegister:    cc.CashInRegister,
			CashWithdrawn:     cc.CashWithdrawn,
			Notes:             cc.Notes,
			TotalSales:        cc.TotalSales,
			TotalRevenue:      cc.TotalRevenue,
			TotalCosts:        cc.TotalCosts,
			TotalProfit:       cc.TotalProfit,
			OrderCount:        cc.OrderCount,
			AverageOrderValue: cc.AverageOrderValue,
			CreatedAt:         cc.CreatedAt,
			UpdatedAt:         cc.UpdatedAt,
		}
		responses = append(responses, response)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(responses)
}

// UpdateCashClosing handles PUT /cash-closings/{id}
func (h *CashClosingHandler) UpdateCashClosing(w http.ResponseWriter, r *http.Request) {
	owner := utils.TokenVerification(r, w)
	if owner == "" {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	cashClosingID := vars["id"]
	if cashClosingID == "" {
		http.Error(w, "Cash closing ID is required", http.StatusBadRequest)
		return
	}

	var request dto.CashClosingRequest
	if err := json.NewDecoder(r.Body).Decode(&request); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Get existing cash closing
	closingDate, err := time.Parse("2006-01-02", request.ClosingDate)
	if err != nil {
		http.Error(w, "Invalid date format", http.StatusBadRequest)
		return
	}

	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "restaurant_id is required", http.StatusBadRequest)
		return
	}

	existingCashClosing, err := h.service.GetCashClosingByDate(restaurantID, closingDate)
	if err != nil {
		http.Error(w, "Cash closing not found", http.StatusNotFound)
		return
	}

	// Update fields
	existingCashClosing.CashInRegister = request.CashInRegister
	existingCashClosing.CashWithdrawn = request.CashWithdrawn
	existingCashClosing.Notes = request.Notes
	existingCashClosing.TotalSales = request.TotalSales
	existingCashClosing.TotalRevenue = request.TotalRevenue
	existingCashClosing.TotalCosts = request.TotalCosts
	existingCashClosing.TotalProfit = request.TotalProfit
	existingCashClosing.OrderCount = request.OrderCount
	existingCashClosing.AverageOrderValue = request.AverageOrderValue

	if err := h.service.UpdateCashClosing(existingCashClosing); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

// DeleteCashClosing handles DELETE /cash-closings/{id}
func (h *CashClosingHandler) DeleteCashClosing(w http.ResponseWriter, r *http.Request) {
	owner := utils.TokenVerification(r, w)
	if owner == "" {
		http.Error(w, "Invalid token", http.StatusUnauthorized)
		return
	}

	vars := mux.Vars(r)
	cashClosingID := vars["id"]
	if cashClosingID == "" {
		http.Error(w, "Cash closing ID is required", http.StatusBadRequest)
		return
	}

	if err := h.service.DeleteCashClosing(cashClosingID); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusNoContent)
}

// GetCashClosingStats handles GET /cash-closings/stats
func (h *CashClosingHandler) GetCashClosingStats(w http.ResponseWriter, r *http.Request) {
	_ = utils.TokenVerification(r, w)

	restaurantID := r.URL.Query().Get("restaurant_id")
	if restaurantID == "" {
		http.Error(w, "restaurant_id is required", http.StatusBadRequest)
		return
	}

	startDateStr := r.URL.Query().Get("start_date")
	endDateStr := r.URL.Query().Get("end_date")

	if startDateStr == "" || endDateStr == "" {
		http.Error(w, "start_date and end_date are required", http.StatusBadRequest)
		return
	}

	startDate, err := time.Parse("2006-01-02", startDateStr)
	if err != nil {
		http.Error(w, "Invalid start_date format", http.StatusBadRequest)
		return
	}

	endDate, err := time.Parse("2006-01-02", endDateStr)
	if err != nil {
		http.Error(w, "Invalid end_date format", http.StatusBadRequest)
		return
	}

	stats, err := h.service.GetCashClosingStats(restaurantID, startDate, endDate)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := dto.CashClosingResponse{
		CashClosingID:     stats.CashClosingID,
		RestaurantID:      stats.RestaurantID,
		ClosingDate:       stats.ClosingDate.Format("2006-01-02"),
		CashInRegister:    stats.CashInRegister,
		CashWithdrawn:     stats.CashWithdrawn,
		Notes:             stats.Notes,
		TotalSales:        stats.TotalSales,
		TotalRevenue:      stats.TotalRevenue,
		TotalCosts:        stats.TotalCosts,
		TotalProfit:       stats.TotalProfit,
		OrderCount:        stats.OrderCount,
		AverageOrderValue: stats.AverageOrderValue,
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
