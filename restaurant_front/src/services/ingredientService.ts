import { getCookie } from '../pages/utils/cookieManager';

import config from '../config/config';

const API_BASE_URL = config.API_URL;

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  merma: number;
}

export const getIngredients = async (restaurantId: string): Promise<Ingredient[]> => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}/ingredients?restaurant_id=${restaurantId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch ingredients');
  }

  return response.json();
};
