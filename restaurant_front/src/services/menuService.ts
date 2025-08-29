import axios from 'axios';
import { MenuItemRequest, MenuItemResponse } from '../interfaces/menuItems';

import config from '../config/config';

const API_URL = config.API_URL;
export const addMenu = async (
  formData: MenuItemRequest,
  token: string,
  restaurantId: string
): Promise<string> => {
  const response = await axios.post<string>(`${API_URL}/menus/${restaurantId}/items`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
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
  const response = await axios.put(`${API_URL}/menus/${restaurantId}/items/${menuItemId}`, data, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
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
