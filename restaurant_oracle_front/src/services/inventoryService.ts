import { getCookie } from '../pages/utils/cookieManager';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface InventoryItem {
  inventory_id?: string;  // Optional for new items
  raw_ingredient_id: string;
  quantity: number;
  unit: 'g' | 'ml' | 'kg' | 'l' | 'un';
  minimum_quantity: number;
  last_restock_date: string;
  price: number;
}

export interface RawIngredient {
  raw_ingredient_id: string;
  category: string;
  name: string;
}

export interface InventoryResponse {
  inventory_id: string;
  restaurant_id: string;
  raw_ingredient_id: string;
  quantity: number;
  unit: 'g' | 'ml' | 'kg' | 'l' | 'un';
  minimum_quantity: number;
  last_restock_date: string;
  price: number;
  merma: number;
  created_at: string;
  updated_at: string;
  raw_ingredient: RawIngredient;
}

export const createInventoryItems = async (restaurantId: string, items: InventoryItem[], token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/inventory?restaurant_id=${restaurantId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(items)
  });

  if (!response.ok) {
    throw new Error('Failed to create inventory items');
  }
};

export const updateInventoryItems = async (restaurantId: string, items: InventoryItem[], token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/inventory`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(items)
  });

  if (!response.ok) {
    throw new Error('Failed to update inventory items');
  }
};

export const getInventory = async (restaurantId: string): Promise<InventoryResponse[]> => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/inventory?restaurant_id=${restaurantId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch inventory');
  }

  return response.json();
};

export const deleteInventoryItem = async (inventoryId: string, restaurantId: string): Promise<void> => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${API_BASE_URL}/inventory/${inventoryId}?restaurant_id=${restaurantId}`, 
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to delete inventory item');
  }
}; 