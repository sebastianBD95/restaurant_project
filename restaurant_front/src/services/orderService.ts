import { getCookie } from '../pages/utils/cookieManager';
import { OrderRequest, OrderStatusUpdate, OrderItem } from '../interfaces/order';
import config from '../config/config';

export const placeOrder = async (orderData: OrderRequest) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${config.API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error('Failed to place order');
  }

  return response.json();
};

export const getOrdersByRestaurant = async (restaurantId: string, status: string, tableId?: string, startDate?: string, endDate?: string) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(
    `${config.API_URL}/orders?restaurant_id=${restaurantId}&status=${status}${tableId ? `&table_id=${tableId}` : ''}${startDate ? `&start_date=${startDate}` : ''}${endDate ? `&end_date=${endDate}` : ''}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (response.status === 402) {
    window.location.href = `/suscripcion`;
    return [];
  }

  if (!response.ok) {
    throw new Error('Failed to fetch orders');
  }

  return response.json();
};

export const updateOrderStatus = async (orderData: OrderStatusUpdate) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${config.API_URL}/orders`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    throw new Error('Failed to update order status');
  }
};

// Add items to an existing order
export const addItemsToOrder = async (orderId: string, items: OrderItem[]) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${config.API_URL}/orders/${orderId}/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(items),
  });

  if (!response.ok) {
    throw new Error('Failed to add items to order');
  }

  return response.json();
};

export const updateOrderItem = async (
  orderId: string,
  menuItemId: string,
  observation: string,
  status: string
) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  await fetch(`${config.API_URL}/orders/${orderId}/items/${menuItemId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ observation, status }),
  });
};

export const cancelOrderItem = async (orderId: string, menuItemId: string, observation: string) => {
  const token = getCookie(document.cookie, 'token');

  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${config.API_URL}/orders/${orderId}/items/${menuItemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ observation }),
  });

  if (!response.ok) {
    throw new Error('Failed to cancel order item');
  }
};

export const createVoidOrderItem = async (
  orderId: string,
  menuItemId: string,
  restaurantId: string,
  observation: string
) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  await fetch(`${config.API_URL}/orders/${orderId}/items/${menuItemId}/void`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ restaurantId, observation }),
  });
};

export const getVoidOrders = async (restaurantId: string) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${config.API_URL}/restaurants/${restaurantId}/order-items/void`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch void orders');
  }

  return response.json();
};

export const recoverVoidOrderItem = async (voidOrderItemId: string, targetOrderId: string) => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${config.API_URL}/void-order-items/${voidOrderItemId}/recover`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ target_order_id: targetOrderId }),
  });

  if (!response.ok) {
    throw new Error('Failed to recover void order item');
  }
};
