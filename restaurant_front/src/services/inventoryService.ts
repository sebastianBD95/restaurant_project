import { getCookie } from '../pages/utils/cookieManager';
import { InventoryItem, InventoryResponse } from '../interfaces/inventory';  

import config from '../config/config';

const API_BASE_URL = config.API_URL;



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