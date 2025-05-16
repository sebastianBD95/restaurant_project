package models

type Ingredient struct {
	IngredientID string  `gorm:"primaryKey;column:ingredient_id" json:"ingredient_id"`
	MenuItemID   string  `gorm:"column:menu_item_id" json:"menu_item_id"`
	Name         string  `gorm:"column:name" json:"name"`
	Price        float64 `gorm:"column:price" json:"price"`
	Amount       float64 `gorm:"column:amount" json:"amount"`
	Unit         string  `gorm:"column:unit" json:"unit"`
}

const (
	UnitGram       = "g"
	UnitMilliliter = "ml"
	UnitKilogram   = "kg"
	UnitLiter      = "l"
	UnitUnit       = "un"
)

func ValidUnits() []string {
	return []string{
		UnitGram,
		UnitMilliliter,
		UnitKilogram,
		UnitLiter,
		UnitUnit,
	}
}

func IsValidUnit(unit string) bool {
	for _, validUnit := range ValidUnits() {
		if unit == validUnit {
			return true
		}
	}
	return false
}
