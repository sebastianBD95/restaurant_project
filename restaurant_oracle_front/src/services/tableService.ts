import { CreateTableRequest, CreateTableResponse, Table } from '../interfaces/table';
const API_BASE_URL = 'http://localhost:8080';


export const createTable = async (data: CreateTableRequest): Promise<CreateTableResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create table');
    }

    return response.json();
  } catch (error) {
    console.error('Error creating table:', error);
    throw error;
  }
};

export const getTables = async (restaurantId: string): Promise<Table[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/tables?restaurant_id=${restaurantId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch tables');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching tables:', error);
    throw error;
  }
}; 