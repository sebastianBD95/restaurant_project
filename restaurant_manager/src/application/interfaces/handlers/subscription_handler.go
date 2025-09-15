package handlers

import (
    "encoding/json"
    "net/http"
    "restaurant_manager/src/application/services"
)

type SubscriptionHandler struct {
    service *services.SubscriptionService
}

func NewSubscriptionHandler(service *services.SubscriptionService) *SubscriptionHandler {
    return &SubscriptionHandler{service: service}
}

func (h *SubscriptionHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
    restaurantID := r.URL.Query().Get("restaurant_id")
    sub, err := h.service.GetStatus(restaurantID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }
    json.NewEncoder(w).Encode(sub)
}

func (h *SubscriptionHandler) Activate(w http.ResponseWriter, r *http.Request) {
    restaurantID := r.URL.Query().Get("restaurant_id")
    amountCOP := 60
    sub, err := h.service.ActivateMonthlyPlan(restaurantID, amountCOP)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(sub)
}

