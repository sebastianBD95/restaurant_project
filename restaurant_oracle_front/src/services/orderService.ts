import { getCookie } from '../pages/utils/cookieManager';

interface OrderItem {
  menu_item_id: string;
  quantity: number;
}

interface OrderRequest {
  table_id: string;
  status: string;
  items: OrderItem[];
}

export const placeOrder = async (orderData: OrderRequest) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch('http://localhost:8080/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    throw new Error('Failed to place order');
  }

  return response.json();
};

export const getOrdersByRestaurant = async (restaurantId: string) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`http://localhost:8080/orders?restaurant_id=${restaurantId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return response.json();
}; 