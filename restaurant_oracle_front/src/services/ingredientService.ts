import { getCookie } from '../pages/utils/cookieManager';

export interface Ingredient {
  name: string;
  price: number;
  amount: number;
  unit: string;
}

export const getIngredients = async (restaurantId: string): Promise<Ingredient[]> => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`http://localhost:8080/ingredients?restaurant_id=${restaurantId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ingredients');
  }

  return response.json();
}; 