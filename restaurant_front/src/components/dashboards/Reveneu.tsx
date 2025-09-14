'use client';

import { Box, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { Tooltip, ResponsiveContainer, XAxis, YAxis, LineChart, Line } from 'recharts';
import { getPaymentHistory } from '../../services/paymentHistoryService';
import { toaster } from '../ui/toaster';

interface RevenueEntry {
  date: string;
  profit: number;
}

interface WeeklyData {
  date: string;
  orders: number;
  revenue: number;
  profit: number;
  itemsSold: number;
}

interface ReveneuProps {
  weeklyData?: WeeklyData[];
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

const DailyProfit = ({ weeklyData }: ReveneuProps) => {
  // Transform weekly data for the chart
  const data = weeklyData?.map(item => ({
    date: item.date,
    profit: item.profit,
  })) || [];
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          fontSize={12}
          tickFormatter={(value) => dayjs(value).format('MM/DD')}
        />
        <YAxis fontSize={12} tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(1)}k`} />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat('es-CO', {
              style: 'currency',
              currency: 'COP',
            }).format(value)
          }
          labelFormatter={(label) => `Ganancia - ${dayjs(label).format('MMM D, YYYY')}`}
        />
        <Line type="monotone" dataKey="profit" stroke="#4CAF50" strokeWidth={2} name="Ganancia" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const PaginaGanancia: React.FC<ReveneuProps> = ({ weeklyData }) => {
  return (
    <Box>
      <Heading size="lg" mb={4}>Ganancias Diarias</Heading>
      <DailyProfit weeklyData={weeklyData} />
    </Box>
  );
};

export default PaginaGanancia;
