import { getCookie } from '../pages/utils/cookieManager';
import { RawIngredient } from '../interfaces/rawIngredients';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';



export const updateRawIngredients = async (ingredients: RawIngredient[], restaurantId: string) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/raw-ingredients?restaurant_id=${restaurantId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(ingredients),
  });

  if (!response.ok) {
    throw new Error('Failed to update raw ingredients');
  }
}

export const deleteRawIngredient = async (rawIngredientId: string, restaurantId: string) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/raw-ingredients/${rawIngredientId}?restaurant_id=${restaurantId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to delete raw ingredient');
  }
}

export const getRawIngredientsByCategory = async (category: string, token: string) => {
    const response = await fetch(
      `${API_BASE_URL}/raw-ingredients?category=${encodeURIComponent(category)}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.json();
  };
