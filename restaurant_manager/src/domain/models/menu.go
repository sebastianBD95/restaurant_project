package models

type MenuItem struct {
	MenuItemID   string   `gorm:"primaryKey;column:menu_item_id" json:"menu_item_id"`
	Name         string   `gorm:"column:name" json:"name"`
	RestaurantID string   `gorm:"column:restaurant_id" json:"restaurant_id"`
	Description  string   `gorm:"column:description" json:"description"`
	Price        float64  `gorm:"column:price" json:"price"`
	Available    bool     `gorm:"column:available" json:"available"`
	ImageURL     string   `gorm:"column:image_url" json:"image_url"`
	Category     Category `gorm:"column:category" json:"category"`
	// Relations
	Ingredients []Ingredient `gorm:"foreignKey:MenuItemID;references:MenuItemID" json:"ingredients"`
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
