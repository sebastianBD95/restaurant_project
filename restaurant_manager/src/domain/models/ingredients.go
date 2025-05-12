package models

type Ingredient struct {
	Ingredient_id string  `json:"ingredient_id"`
	MenuItemID    string  `json:"menu_item_id,omitempty"`
	Name          string  `json:"name"`
	Price         float64 `json:"price"`
	Amount        float64 `json:"amount"`
	Unit          string  `json:"unit"`
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
