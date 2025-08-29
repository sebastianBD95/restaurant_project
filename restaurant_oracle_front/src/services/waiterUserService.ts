import axios from 'axios';
import { WaiterUser } from '../interfaces/waiter';
import config from '../config/config';

const API_URL = config.API_URL;



export const createWaiterUser = async (userData: Omit<WaiterUser, 'user_id' | 'role'>, token: string): Promise<String> => {
  try {
    const response = await axios.post<String>(`${API_URL}/register`, 
      { ...userData, role: 'waiter' }, 
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Failed to create waiter user: ' + error.message);
    }
    throw new Error('Failed to create waiter user: An unknown error occurred');
  }
};

export const getWaiterUsers = async (token: string,restaurant: string): Promise<Omit<WaiterUser,'password'>[]> => {
  try {
    const response = await axios.get<Omit<WaiterUser,'password'>[]>(`${API_URL}/users?restaurantId=${restaurant}&role=waiter`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Failed to get waiter users: ' + error.message);
    }
    throw new Error('Failed to get waiter users: An unknown error occurred');
  }
};

export const updateWaiterUser = async (id: string, userData: Partial<WaiterUser>, token: string): Promise<WaiterUser> => {
  try {
    const response = await axios.put<WaiterUser>(`${API_URL}/users?id=${id}`, 
      userData, 
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Failed to update waiter user: ' + error.message);
    }
    throw new Error('Failed to update waiter user: An unknown error occurred');
  }
};

export const deleteWaiterUser = async (id: string, token: string): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/users?id=${id}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Failed to delete waiter user: ' + error.message);
    }
    throw new Error('Failed to delete waiter user: An unknown error occurred');
  }
}; 