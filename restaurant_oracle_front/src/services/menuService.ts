import axios from 'axios';
import { MenuData, MenuItemRequest,MenuItemResponse } from '../interfaces/menuItems';

const API_URL = 'http://localhost:8080';
export const addMenu = async (formData: MenuItemRequest, token: string,restaurantId :string): Promise<String> => {
  try {
    const response = await axios.post<String>(`${API_URL}/menus/${restaurantId}/items`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Registration failed: ' + error.message);
    }
    throw new Error('Registration failed: An unknown error occurred');
  }
};

export const getMenus = async (token: string, restaurantId :string): Promise<MenuItemResponse[]> => {
  try {
    const response = await axios.get<MenuItemResponse[]>(`${API_URL}/menus/${restaurantId}/items`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const editMenuItem = async (menuItemId: string, data: Partial<MenuItemRequest>, token: string, restaurantId: string) => {
  try {
    const response = await axios.put(`${API_URL}/menus/${restaurantId}/items/${menuItemId}`, data, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const hideMenuItem = async (menuItemId: string, token: string, restaurantId: string) => {
  try {
    const response = await axios.patch(`${API_URL}/menus/${restaurantId}/items/${menuItemId}`, { hidden: true }, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};

export const deleteMenuItem = async (menuItemId: string, token: string, restaurantId: string) => {
  try {
    const response = await axios.delete(`${API_URL}/menus/${restaurantId}/items/${menuItemId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
