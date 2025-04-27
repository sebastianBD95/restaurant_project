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
    console.log('service: %s', response);
    return response.data;
  } catch (error: any) {
    throw error;
  }
};
