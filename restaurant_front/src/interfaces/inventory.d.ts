export interface InventoryItem {
  inventory_id?: string; // Optional for new items
  raw_ingredient_id: string;
  quantity: number;
  unit: 'g' | 'ml' | 'kg' | 'l' | 'unidad';
  minimum_quantity: number;
  last_restock_date: string;
  price: number;
}

export interface InventoryResponse {
  inventory_id: string;
  restaurant_id: string;
  raw_ingredient_id: string;
  quantity: number;
  unit: 'g' | 'ml' | 'kg' | 'l' | 'unidad';
  minimum_quantity: number;
  last_restock_date: string;
  price: number;
  merma: number;
  created_at: string;
  updated_at: string;
  raw_ingredient: RawIngredient;
}

export interface Inventory {
  id: string; // maps to inventory_id
  raw_ingredient_id: string;
  nombre: string; // derived from raw_ingredient
  categoria: string; // derived from raw_ingredient
  cantidad: number; // maps to quantity
  unidad: 'g' | 'ml' | 'kg' | 'l' | 'unidad'; // maps to unit with strict types
  cantidad_minima: number; // maps to minimum_quantity
  precio: number; // maps to price
  merma: number; // maps to merma
  ultima_reposicion?: Date; // maps to last_restock_date
  isModified?: boolean; // track if item has been modified
  isNew?: boolean; // track if item is newly added
}
