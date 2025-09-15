package services

import (
    "errors"
    "time"
    "restaurant_manager/src/domain/models"
    "restaurant_manager/src/domain/repositories"
)

type SubscriptionService struct {
    repo repositories.SubscriptionRepository
}

func NewSubscriptionService(repo repositories.SubscriptionRepository) *SubscriptionService {
    return &SubscriptionService{repo: repo}
}

func (s *SubscriptionService) GetStatus(restaurantID string) (*models.Subscription, error) {
    if restaurantID == "" {
        return nil, errors.New("restaurant ID is required")
    }
    return s.repo.GetByRestaurantID(restaurantID)
}

func (s *SubscriptionService) ActivateMonthlyPlan(restaurantID string, amountCOP int) (*models.Subscription, error) {
    if restaurantID == "" {
        return nil, errors.New("restaurant ID is required")
    }
    now := time.Now().UTC()
    sub := &models.Subscription{
        RestaurantID:       restaurantID,
        Status:             models.SubscriptionActive,
        PlanAmountCOP:      amountCOP,
        CurrentPeriodStart: now,
        CurrentPeriodEnd:   now.AddDate(0, 1, 0),
    }
    if err := s.repo.Upsert(sub); err != nil {
        return nil, err
    }
    return s.repo.GetByRestaurantID(restaurantID)
}

func (s *SubscriptionService) IsActive(restaurantID string) (bool, *models.Subscription, error) {
    sub, err := s.repo.GetByRestaurantID(restaurantID)
    if err != nil {
        return false, nil, err
    }
    if sub.Status != models.SubscriptionActive {
        return false, sub, nil
    }
    if time.Now().UTC().After(sub.CurrentPeriodEnd) {
        return false, sub, nil
    }
    return true, sub, nil
}

