package models

type Ingredient struct {
	IngredientID    string  `gorm:"primaryKey;column:ingredient_id" json:"ingredient_id"`
	MenuItemID      string  `gorm:"column:menu_item_id" json:"menu_item_id"`
	RawIngredientID string  `gorm:"column:raw_ingredient_id" json:"raw_ingredient_id"`
	Price           float64 `gorm:"column:price" json:"price"`
	Amount          float64 `gorm:"column:amount" json:"amount"`
	Unit            string  `gorm:"column:unit" json:"unit"`
	// Relations
	RawIngredient *RawIngredient `gorm:"foreignKey:RawIngredientID;references:ID" json:"raw_ingredient"`
}

const (
	UnitGram       = "g"
	UnitMilliliter = "ml"
	UnitKilogram   = "kg"
	UnitLiter      = "l"
	UnitUnit       = "unidad"
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
