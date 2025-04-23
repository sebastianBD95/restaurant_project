import axios from 'axios';
import { ResturantDataRequest, ResturantDataResponse } from '../interfaces/restaurant';

const API_URL = 'http://localhost:8080';
export const addRestarurant = async (
  formData: ResturantDataRequest,
  token: string
): Promise<String> => {
  try {
    const response = await axios.post<String>(`${API_URL}/restaurants`, formData, {
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

export const getRestaurants = async (token: string): Promise<ResturantDataResponse[]> => {
  try {
    const response = await axios.get<ResturantDataResponse[]>(`${API_URL}/restaurants`, {
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
