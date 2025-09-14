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

interface WeeklyData {
  date: string;
  orders: number;
  revenue: number;
  profit: number;
  itemsSold: number;
}

interface DailyRevenueProps {
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

const DailyRevenue = ({ weeklyData }: DailyRevenueProps) => {
  // Transform weekly data for the chart
  const data = weeklyData?.map(item => ({
    date: item.date,
    revenue: item.revenue,
    cost: item.revenue * 0.7, // Assuming 70% cost, 30% profit
  })) || [];
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

const PaginaIngresos: React.FC<DailyRevenueProps> = ({ weeklyData }) => {
  // Use the weekly data passed from parent component
  const data = weeklyData?.map(item => ({
    date: item.date,
    revenue: item.revenue,
    cost: item.revenue * 0.7, // Assuming 70% cost, 30% profit
  })) || [];

  return (
    <Box>
      <Heading size="lg" mb={4}>Ingresos Diarios</Heading>
      <DailyRevenue weeklyData={weeklyData} />
    </Box>
  );
};

export default PaginaIngresos;
