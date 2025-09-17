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

func (s *SubscriptionService) GetStatus(userID string) (*models.Subscription, error) {
    if userID == "" {
        return nil, errors.New("user ID is required")
    }
    return s.repo.GetByUserID(userID)
}

func (s *SubscriptionService) ActivateMonthlyPlan(userID string, amountCOP int) (*models.Subscription, error) {
    if userID == "" {
        return nil, errors.New("user ID is required")
    }
    now := time.Now().UTC()
    sub := &models.Subscription{
        UserID:             userID,
        Status:             models.SubscriptionActive,
        PlanAmountCOP:      amountCOP,
        CurrentPeriodStart: now,
        CurrentPeriodEnd:   now.AddDate(0, 1, 0),
    }
    if err := s.repo.UpsertByUser(sub); err != nil {
        return nil, err
    }
    return s.repo.GetByUserID(userID)
}

func (s *SubscriptionService) IsActive(userID string) (bool, *models.Subscription, error) {
    sub, err := s.repo.GetByUserID(userID)
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

