import axios from 'axios';
import { MenuItemRequest, MenuItemResponse } from '../interfaces/menuItems';

import config from '../config/config';

const API_URL = config.API_URL;
export const addMenu = async (
  formData: MenuItemRequest,
  token: string,
  restaurantId: string
): Promise<string> => {
  try {
    const response = await axios.post<string>(`${API_URL}/menus/${restaurantId}/items`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.error || 'No se pudo crear el plato';
    if (status === 402) {
      throw new Error(message);
    }
    throw new Error(message);
  }
};

export const getMenus = async (
  token: string,
  restaurantId: string
): Promise<MenuItemResponse[]> => {
  const response = await axios.get<MenuItemResponse[]>(`${API_URL}/menus/${restaurantId}/items`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const editMenuItem = async (
  menuItemId: string,
  data: Partial<MenuItemRequest>,
  token: string,
  restaurantId: string
) => {
  try {
    const response = await axios.put(`${API_URL}/menus/${restaurantId}/items/${menuItemId}`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const message = error?.response?.data?.error || 'No se pudo actualizar el plato';
    throw new Error(message);
  }
};

export const hideMenuItem = async (menuItemId: string, token: string, restaurantId: string) => {
  const response = await axios.patch(
    `${API_URL}/menus/${restaurantId}/items/${menuItemId}`,
    { hidden: true },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export const deleteMenuItem = async (menuItemId: string, token: string, restaurantId: string) => {
  const response = await axios.delete(`${API_URL}/menus/${restaurantId}/items/${menuItemId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
