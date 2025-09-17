package services

import (
	"time"

	"gorm.io/gorm"
)

type FeatureLimiter struct {
	db                  *gorm.DB
	subscriptionService *SubscriptionService
}

func NewFeatureLimiter(db *gorm.DB, subscriptionService *SubscriptionService) *FeatureLimiter {
	return &FeatureLimiter{db: db, subscriptionService: subscriptionService}
}

func (f *FeatureLimiter) isFreeTier(userID string) bool {
	ok, _, err := f.subscriptionService.IsActive(userID)
	if err != nil {
		return true
	}
	return !ok
}

func (f *FeatureLimiter) CanCreateRestaurant(userID string) bool {
	if !f.isFreeTier(userID) {
		return true
	}
	var count int64
	f.db.Table("servu.restaurants").Where("owner_id = ?", userID).Count(&count)
	return count < 1
}

func (f *FeatureLimiter) CanAddMenuItem(userID string, restaurantID string) bool {
	if !f.isFreeTier(userID) {
		return true
	}
	var count int64
	f.db.Table("servu.menu_items").Where("restaurant_id = ?", restaurantID).Count(&count)
	return count < 5
}

func (f *FeatureLimiter) CanAddRawIngredients(userID string, restaurantID string, additional int) bool {
	if !f.isFreeTier(userID) {
		return true
	}
	var count int64
	f.db.Table("servu.raw_ingredients").Where("restaurant_id = ?", restaurantID).Count(&count)
	return int(count)+additional <= 25
}

func (f *FeatureLimiter) CanCreateOrder(userID string, restaurantID string) bool {
	if !f.isFreeTier(userID) {
		return true
	}
	var count int64
	f.db.Table("servu.orders").Where("restaurant_id = ?", restaurantID).Count(&count)
	return count < 25
}

func (f *FeatureLimiter) CanCreateCashClosing(userID string, restaurantID string, date time.Time) bool {
	if !f.isFreeTier(userID) {
		return true
	}
	var count int64
	f.db.Table("servu.cash_closings").
		Where("restaurant_id = ? AND date_trunc('month', closing_date) = date_trunc('month', ?)", restaurantID, date).
		Count(&count)
	return count < 2
}

func (f *FeatureLimiter) CanCreateWaiterUser(userID string, restaurantID string) bool {
    if !f.isFreeTier(userID) {
        return true
    }
    var count int64
    f.db.Table("servu.users").Where("restaurant_id = ? AND role = ?", restaurantID, "waiter").Count(&count)
    return count < 3
}

