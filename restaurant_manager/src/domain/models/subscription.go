package models

import "time"

type SubscriptionStatus string

const (
    SubscriptionActive   SubscriptionStatus = "active"
    SubscriptionPastDue  SubscriptionStatus = "past_due"
    SubscriptionCanceled SubscriptionStatus = "canceled"
    SubscriptionTrialing SubscriptionStatus = "trialing"
)

type Subscription struct {
    SubscriptionID     string              `gorm:"primaryKey;column:subscription_id" json:"subscription_id"`
    RestaurantID       string              `gorm:"column:restaurant_id" json:"restaurant_id"`
    UserID             string              `gorm:"column:user_id" json:"user_id"`
    Status             SubscriptionStatus  `gorm:"column:status" json:"status"`
    PlanAmountCOP      int                 `gorm:"column:plan_amount_cop" json:"plan_amount_cop"`
    CurrentPeriodStart time.Time           `gorm:"column:current_period_start" json:"current_period_start"`
    CurrentPeriodEnd   time.Time           `gorm:"column:current_period_end" json:"current_period_end"`
    CreatedAt          time.Time           `gorm:"column:created_at" json:"created_at"`
    UpdatedAt          time.Time           `gorm:"column:updated_at" json:"updated_at"`
}

