import axios from 'axios';
import { ResturantDataRequest, ResturantDataResponse } from '../interfaces/restaurant';
import config from '../config/config';

const API_URL = config.API_URL;

export const addRestarurant = async (
  formData: ResturantDataRequest,
  token: string
): Promise<string> => {
  try {
    const response = await axios.post<string>(`${API_URL}/restaurants`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error: any) {
    const status = error?.response?.status;
    const message = error?.response?.data?.error || 'No se pudo crear el restaurante';
    if (status === 402) {
      throw new Error(message);
    }
    throw new Error(message);
  }
};

export const getRestaurants = async (token: string): Promise<ResturantDataResponse[]> => {
  const response = await axios.get<ResturantDataResponse[]>(`${API_URL}/restaurants`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};
