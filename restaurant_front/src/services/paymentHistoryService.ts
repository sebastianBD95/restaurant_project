import { getCookie } from '../pages/utils/cookieManager';
import config from '../config/config';

export interface PaymentRecord {
  order_id: string;
  table: number;
  items: any[];
  total_price: number;
  status: string;
  created_at: string;
  payment_method: string;
  customer_name: string;
  customer_id: string;
  customer_email: string;
  restaurant_id: string;
}

export interface PaymentFilters {
  timeFilter: 'month' | 'last3months' | 'year' | 'all';
  paymentMethod: string;
  startDate?: string;
  endDate?: string;
  table?: number;
  minAmount?: number;
  maxAmount?: number;
}

export const getPaymentHistory = async (
  restaurantId: string,
  filters: PaymentFilters = { timeFilter: 'month', paymentMethod: 'all' }
): Promise<PaymentRecord[]> => {
  const token = getCookie(document.cookie, 'token');
  if (!token) {
    throw new Error('No authentication token found');
  }

  try {
    // Obtener pedidos pagados
    const response = await fetch(
      `${config.API_URL}/orders?restaurant_id=${restaurantId}&status=paid`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch payment history');
    }

    const orders = await response.json();
    
    if (!Array.isArray(orders)) {
      return [];
    }

    // Transformar los datos a PaymentRecord
    const paymentRecords: PaymentRecord[] = orders.map((order: any) => ({
      order_id: order.order_id || order.id || '',
      table: order.table || order.table_id || 0,
      items: order.items || [],
      total_price: order.total_price || 0,
      status: order.status || 'paid',
      created_at: order.created_at || new Date().toISOString(),
      payment_method: order.payment_method || 'efectivo',
      customer_name: order.customer_name || '',
      customer_id: order.customer_id || '',
      customer_email: order.customer_email || '',
      restaurant_id: order.restaurant_id || restaurantId,
    }));

    return paymentRecords;
  } catch (error) {
    console.error('Error fetching payment history:', error);
    throw error;
  }
};

export const getPaymentStats = async (restaurantId: string, filters: PaymentFilters) => {
  try {
    const payments = await getPaymentHistory(restaurantId, filters);
    
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.total_price, 0);
    const totalPayments = payments.length;
    const averagePayment = totalPayments > 0 ? totalRevenue / totalPayments : 0;

    // Distribución por método de pago
    const paymentsByMethod = payments.reduce((acc, payment) => {
      const method = payment.payment_method;
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Distribución por mes
    const paymentsByMonth = payments.reduce((acc, payment) => {
      const month = new Date(payment.created_at).toLocaleDateString('es-CO', { 
        year: 'numeric', 
        month: 'long' 
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Top mesas por ingresos
    const topTables = payments.reduce((acc, payment) => {
      const table = payment.table;
      acc[table] = (acc[table] || 0) + payment.total_price;
      return acc;
    }, {} as Record<number, number>);

    const topTablesArray = Object.entries(topTables)
      .map(([table, revenue]) => ({ table: parseInt(table), revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalPayments,
      averagePayment,
      paymentsByMethod,
      paymentsByMonth,
      topTables: topTablesArray,
    };
  } catch (error) {
    console.error('Error calculating payment stats:', error);
    throw error;
  }
};

export const exportPaymentHistoryToCSV = (payments: PaymentRecord[], filename: string) => {
  const headers = [
    'Fecha',
    'Hora',
    'Mesa',
    'Total',
    'Método de Pago',
    'Cliente',
    'ID Cliente',
    'Email',
    'Estado'
  ];

  const csvContent = [
    headers.join(','),
    ...payments.map(payment => [
      new Date(payment.created_at).toLocaleDateString('es-CO'),
      new Date(payment.created_at).toLocaleTimeString('es-CO', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      payment.table,
      payment.total_price,
      payment.payment_method,
      payment.customer_name || '',
      payment.customer_id || '',
      payment.customer_email || '',
      payment.status
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const getPaymentMethods = () => {
  return [
    { value: 'efectivo', label: 'Efectivo', color: 'green' },
    { value: 'debito', label: 'Débito', color: 'blue' },
    { value: 'credito', label: 'Crédito', color: 'purple' },
    { value: 'pse', label: 'PSE', color: 'orange' },
  ];
};

export const getTimeFilterOptions = () => {
  return [
    { value: 'month', label: 'Este mes' },
    { value: 'last3months', label: 'Últimos 3 meses' },
    { value: 'year', label: 'Este año' },
    { value: 'all', label: 'Todo el historial' },
  ];
};