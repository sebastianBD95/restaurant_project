'use client';

import { Box, Heading, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useParams } from 'react-router-dom';
import { getOrdersByRestaurant } from '../../services/orderService';

interface WeeklyData {
  date: string;
  orders: number;
  revenue: number;
  profit: number;
  itemsSold: number;
}

interface DailyOrdersProps {
  weeklyData?: WeeklyData[];
}

const DailyOrders = ({ weeklyData }: DailyOrdersProps) => {
  // Transform weekly data for the chart
  const chartData = weeklyData?.map(item => ({
    date: item.date,
    value: item.orders,
  })) || [];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} barSize={15} margin={{ top: 30, right: 10, left: -25, bottom: 0 }}>
        <XAxis
          dataKey="date"
          fontSize={12}
          tickFormatter={(value) => dayjs(value).format('MM/DD')}
        />
        <YAxis dataKey="value" fontSize={12} />
        <Bar type="natural" dataKey="value" fill="#2196F3" />
        <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.2)', radius: 4 }} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DailyOrders;
