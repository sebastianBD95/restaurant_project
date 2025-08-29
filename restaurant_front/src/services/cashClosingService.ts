import config from '../config/config';

const API_BASE_URL = config.API_URL;

export interface CashClosingData {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  orderCount: number;
  averageOrderValue: number;
  topSellingItems: Array<{
    name: string;
    quantity: number;
    revenue: number;
  }>;
  paymentMethods: Array<{
    method: string;
    amount: number;
    count: number;
  }>;
  cashInRegister: number;
  cashWithdrawn: number;
  notes: string;
}

export interface CashClosingRequest {
  date: string;
  cashInRegister: number;
  cashWithdrawn: number;
  notes: string;
  totalSales: number;
  totalRevenue: number;
  totalCosts: number;
  totalProfit: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface CashClosingResponse {
  cash_closing_id: string;
  restaurant_id: string;
  closing_date: string;
  cash_in_register: number;
  cash_withdrawn: number;
  notes: string;
  total_sales: number;
  total_revenue: number;
  total_costs: number;
  total_profit: number;
  order_count: number;
  average_order_value: number;
  created_at: string;
  updated_at: string;
}

// Interfaces for existing data
interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  status: string;
  observation: string;
  image: string;
}

interface MenuItem {
  menu_item_id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image_url: string;
  category: string;
  side_dishes: number;
  ingredients: Array<{
    ingredient_id: string;
    name: string;
    category: string;
    price: number;
    amount: number;
    unit: string;
    merma: number;
  }>;
}

/**
 * Obtiene los datos de cierre de caja para una fecha específica
 * Ahora usa el endpoint del backend
 */
export const getCashClosingData = async (
  token: string,
  restaurantId: string,
  date: string
): Promise<CashClosingData> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cash-closings/data?restaurant_id=${restaurantId}&date=${date}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cash closing data');
    }

    const data = await response.json();

    return {
      date: data.closing_date,
      totalSales: data.total_sales,
      totalRevenue: data.total_revenue,
      totalCosts: data.total_costs,
      totalProfit: data.total_profit,
      orderCount: data.order_count,
      averageOrderValue: data.average_order_value,
      topSellingItems: data.top_selling_items || [],
      paymentMethods: data.payment_methods || [],
      cashInRegister: data.cash_in_register || 0,
      cashWithdrawn: data.cash_withdrawn || 0,
      notes: data.notes || '',
    };
  } catch (error) {
    console.error('Error fetching cash closing data:', error);
    throw new Error('Error al obtener datos de cierre de caja');
  }
};

/**
 * Realiza el cierre de caja para una fecha específica
 * Ahora usa el endpoint del backend
 */
export const performCashClosing = async (
  token: string,
  restaurantId: string,
  cashClosingData: CashClosingRequest
): Promise<CashClosingResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/cash-closings?restaurant_id=${restaurantId}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        closing_date: cashClosingData.date,
        cash_in_register: cashClosingData.cashInRegister,
        cash_withdrawn: cashClosingData.cashWithdrawn,
        notes: cashClosingData.notes,
        total_sales: cashClosingData.totalSales,
        total_revenue: cashClosingData.totalRevenue,
        total_costs: cashClosingData.totalCosts,
        total_profit: cashClosingData.totalProfit,
        order_count: cashClosingData.orderCount,
        average_order_value: cashClosingData.averageOrderValue,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to perform cash closing');
    }

    return response.json();
  } catch (error) {
    console.error('Error performing cash closing:', error);
    throw new Error('Error al realizar el cierre de caja');
  }
};

/**
 * Obtiene el historial de cierres de caja para un restaurante
 * Ahora usa el endpoint del backend
 */
export const getCashClosingHistory = async (
  token: string,
  restaurantId: string,
  startDate?: string,
  endDate?: string
): Promise<CashClosingResponse[]> => {
  try {
    let url = `${API_BASE_URL}/cash-closings/history?restaurant_id=${restaurantId}`;
    if (startDate) {
      url += `&start_date=${startDate}`;
    }
    if (endDate) {
      url += `&end_date=${endDate}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch cash closing history');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching cash closing history:', error);
    throw new Error('Error al obtener historial de cierres de caja');
  }
};

/**
 * Actualiza un cierre de caja existente
 * Ahora usa el endpoint del backend
 */
export const updateCashClosing = async (
  token: string,
  cashClosingId: string,
  restaurantId: string,
  cashClosingData: Partial<CashClosingRequest>
): Promise<CashClosingResponse> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cash-closings/${cashClosingId}?restaurant_id=${restaurantId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          closing_date: cashClosingData.date,
          cash_in_register: cashClosingData.cashInRegister,
          cash_withdrawn: cashClosingData.cashWithdrawn,
          notes: cashClosingData.notes,
          total_sales: cashClosingData.totalSales,
          total_revenue: cashClosingData.totalRevenue,
          total_costs: cashClosingData.totalCosts,
          total_profit: cashClosingData.totalProfit,
          order_count: cashClosingData.orderCount,
          average_order_value: cashClosingData.averageOrderValue,
        }),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to update cash closing');
    }

    return response.json();
  } catch (error) {
    console.error('Error updating cash closing:', error);
    throw new Error('Error al actualizar el cierre de caja');
  }
};

/**
 * Elimina un cierre de caja
 * Ahora usa el endpoint del backend
 */
export const deleteCashClosing = async (
  token: string,
  cashClosingId: string,
  restaurantId: string
): Promise<void> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cash-closings/${cashClosingId}?restaurant_id=${restaurantId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to delete cash closing');
    }
  } catch (error) {
    console.error('Error deleting cash closing:', error);
    throw new Error('Error al eliminar el cierre de caja');
  }
};

/**
 * Obtiene estadísticas resumidas de cierre de caja para un período
 * Ahora usa el endpoint del backend
 */
export const getCashClosingStats = async (
  token: string,
  restaurantId: string,
  startDate: string,
  endDate: string
) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/cash-closings/stats?restaurant_id=${restaurantId}&start_date=${startDate}&end_date=${endDate}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch cash closing stats');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching cash closing stats:', error);
    throw new Error('Error al obtener estadísticas de cierre de caja');
  }
};
