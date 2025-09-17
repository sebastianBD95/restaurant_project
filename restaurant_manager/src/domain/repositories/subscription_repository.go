package repositories

import "restaurant_manager/src/domain/models"

type SubscriptionRepository interface {
    GetByUserID(userID string) (*models.Subscription, error)
    UpsertByUser(sub *models.Subscription) error
}

