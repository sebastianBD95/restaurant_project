package models

type RawIngredient struct {
	ID       string `gorm:"primaryKey;column:raw_ingredient_id" json:"raw_ingredient_id"`
	Category string `gorm:"column:category" json:"category"`
	Name     string `gorm:"column:name" json:"name"`
}
