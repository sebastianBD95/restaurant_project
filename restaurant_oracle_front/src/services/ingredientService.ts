import { getCookie } from '../pages/utils/cookieManager';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface Ingredient {
  raw_ingredient_id: string;
  name: string;
  category: string;
}

export const getIngredients = async (restaurantId: string): Promise<Ingredient[]> => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/ingredients?restaurant_id=${restaurantId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ingredients');
  }

  return response.json();
}; 

export const getRawIngredientsByCategory = async (category: string, token: string) => {
  const response = await fetch(
    `${API_BASE_URL}/raw-ingredients?category=${encodeURIComponent(category)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  return response.json();
};