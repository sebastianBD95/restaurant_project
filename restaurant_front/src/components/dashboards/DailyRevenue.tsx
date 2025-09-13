'use client';

import { Box, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Tooltip, ResponsiveContainer, XAxis, YAxis, AreaChart, Area } from 'recharts';
import { getPaymentHistory } from '../../services/paymentHistoryService';
import { toaster } from '../ui/toaster';

interface RevenueEntry {
  date: string;
  revenue: number;
  cost: number;
}

interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  status: string;
  observation: string;
  image?: string;
  created_at?: string;
}

const DailyRevenue = ({ data }: { data: RevenueEntry[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          fontSize={12}
          tickFormatter={(value) => dayjs(value).format('MM/DD')}
        />
        <YAxis fontSize={12} tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(1)}k`} />
        <defs>
          <linearGradient id="revenue-color" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2196F3" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#2196F3" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="cost-color" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FF5722" stopOpacity={0.5} />
            <stop offset="95%" stopColor="#FF5722" stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#2196F3"
          fill="url(#revenue-color)"
          name="Ingresos"
        />
        <Area
          type="monotone"
          dataKey="cost"
          stroke="#FF5722"
          fill="url(#cost-color)"
          name="Costos"
        />
        <Tooltip
          formatter={(value: number, _name: string) =>
            new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
            }).format(value)
          }
          labelFormatter={(label) => dayjs(label).format('MMM D, YYYY')}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

const PaginaIngresos: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const { restaurantId } = useParams();

  useEffect(() => {
    async function fetchRevenueData() {
      if (!restaurantId) return;
      
      try {
        setLoading(true);
        // Fetch paid orders from the last 30 days
        const paymentData = await getPaymentHistory(restaurantId, {
          timeFilter: 'month',
          paymentMethod: 'all'
        });

        const daily: Record<string, { revenue: number; cost: number }> = {};

        paymentData.forEach((payment: any) => {
          // Use created_at instead of timestamp and convert to local timezone
          const date = new Date(payment.created_at);
          const localDateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format
          
          const totalRevenue = payment.total_price || 0;
          let totalCost = 0;

          // Calculate cost based on items (simplified - you might want to get actual cost data from menu items)
          if (payment.items && Array.isArray(payment.items)) {
            payment.items.forEach((item: OrderItem) => {
              // For now, estimate cost as 30% of revenue (you can improve this with actual cost data)
              const estimatedCost = (item.price * item.quantity) * 0.3;
              totalCost += estimatedCost;
            });
          }

          if (!daily[localDateString]) daily[localDateString] = { revenue: 0, cost: 0 };
          daily[localDateString].revenue += totalRevenue;
          daily[localDateString].cost += totalCost;
        });

        const formatted: RevenueEntry[] = Object.entries(daily)
          .map(([date, { revenue, cost }]) => ({
            date,
            revenue,
            cost,
          }))
          .sort((a, b) => a.date.localeCompare(b.date)); // Sort by date

        setRevenueData(formatted);
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: 'Error al cargar datos de ingresos.',
          type: 'error',
          duration: 5000,
        });
        console.error('Error fetching revenue data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRevenueData();
  }, [restaurantId]);

  if (loading) {
    return (
      <Box>
        <Heading size="lg" mb={4}>Ingresos Diarios</Heading>
        <Box textAlign="center" py={8}>
          Cargando datos...
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>Ingresos Diarios</Heading>
      <DailyRevenue data={revenueData} />
    </Box>
  );
};

export default PaginaIngresos;
