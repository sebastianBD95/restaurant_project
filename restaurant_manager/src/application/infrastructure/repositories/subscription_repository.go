package repositories

import (
    "restaurant_manager/src/domain/models"
    "restaurant_manager/src/domain/repositories"

    "gorm.io/gorm"
    "gorm.io/gorm/clause"
)

type SubscriptionRepositoryImpl struct {
    db *gorm.DB
}

func NewSubscriptionRepository(db *gorm.DB) repositories.SubscriptionRepository {
    return &SubscriptionRepositoryImpl{db: db}
}

func (r *SubscriptionRepositoryImpl) GetByRestaurantID(restaurantID string) (*models.Subscription, error) {
    var sub models.Subscription
    if err := r.db.Where("restaurant_id = ?", restaurantID).First(&sub).Error; err != nil {
        return nil, err
    }
    return &sub, nil
}

func (r *SubscriptionRepositoryImpl) Upsert(sub *models.Subscription) error {
    return r.db.Clauses(clause.OnConflict{
        Columns:   []clause.Column{{Name: "restaurant_id"}},
        DoUpdates: clause.Assignments(map[string]interface{}{
            "status":                sub.Status,
            "plan_amount_cop":      sub.PlanAmountCOP,
            "current_period_start": sub.CurrentPeriodStart,
            "current_period_end":   sub.CurrentPeriodEnd,
            "updated_at":           gorm.Expr("CURRENT_TIMESTAMP"),
        }),
    }).Create(sub).Error
}

