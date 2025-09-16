package handlers

import (
    "encoding/json"
    "net/http"
    "restaurant_manager/src/application/services"
    "restaurant_manager/src/application/utils"
)

type SubscriptionHandler struct {
    service *services.SubscriptionService
}

func NewSubscriptionHandler(service *services.SubscriptionService) *SubscriptionHandler {
    return &SubscriptionHandler{service: service}
}

func (h *SubscriptionHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
    userID := utils.TokenVerification(r, w)
    if userID == "" {
        return
    }
    sub, err := h.service.GetStatus(userID)
    if err != nil {
        http.Error(w, err.Error(), http.StatusNotFound)
        return
    }
    json.NewEncoder(w).Encode(sub)
}

func (h *SubscriptionHandler) Activate(w http.ResponseWriter, r *http.Request) {
    amountCOP := 60
    userID := utils.TokenVerification(r, w)
    if userID == "" {
        return
    }
    sub, err := h.service.ActivateMonthlyPlan(userID, amountCOP)
    if err != nil {
        http.Error(w, err.Error(), http.StatusInternalServerError)
        return
    }
    w.WriteHeader(http.StatusCreated)
    json.NewEncoder(w).Encode(sub)
}

