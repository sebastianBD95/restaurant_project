package models

type MenuItem struct {
	MenuItemID   string   `gorm:"primaryKey;column:menu_item_id" json:"menu_item_id"`
	RestaurantID string   `gorm:"column:restaurant_id" json:"restaurant_id"`
	Name         string   `gorm:"column:name" json:"name"`
	Description  string   `gorm:"column:description" json:"description"`
	Price        float64  `gorm:"column:price" json:"price"`
	Available    bool     `gorm:"column:available" json:"available"`
	ImageURL     string   `gorm:"column:image_url" json:"image_url"`
	Category     Category `gorm:"column:category" json:"category"`
}

type Category string

const (
	Appetizer Category = "Appetizer"
	Dessert   Category = "Dessert"
	Main      Category = "Main"
	Soup      Category = "Soup"
	Salad     Category = "Salad"
	Drinks    Category = "Drinks"
)
