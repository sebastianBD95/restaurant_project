import axios from 'axios';
import { UserData } from '../interfaces/autho';

import config from '../config/config';

const API_URL = config.API_URL;

// Define the structure of the response (adjust according to your backend response)
interface AuthResponse {
  token?: string;
  role?: string;
  restaurant_id?: string;
}

export const registerUser = async (formData: UserData): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/register`, formData, {
      headers: {
        'Content-Type': 'application/json',
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

export const loginUser = async (username: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axios.post<AuthResponse>(`${API_URL}/login`, {
      Email: username,
      Password: password,
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error('Login failed: ' + error.message);
    }
    throw new Error('Login failed: An unknown error occurred');
  }
};
