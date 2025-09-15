package repositories

import "restaurant_manager/src/domain/models"

type SubscriptionRepository interface {
    GetByRestaurantID(restaurantID string) (*models.Subscription, error)
    Upsert(sub *models.Subscription) error
}

