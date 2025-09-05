'use client';

import { Box, Heading, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { BarChart, Bar, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { useParams } from 'react-router-dom';
import { getOrdersByRestaurant } from '../../services/orderService';

//Componente DailyOrders para mostrar la gráfica
const DailyOrders = ({ data }: { data: { date: string; value: number }[] }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} barSize={15} margin={{ top: 30, right: 10, left: -25, bottom: 0 }}>
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

const DashboardDO: React.FC = () => {
  const [chartData, setChartData] = useState<{ date: string; value: number }[]>([]);
  const { restaurantId } = useParams();

  useEffect(() => {
    async function fetchOrders() {
      if (!restaurantId) return;
      const orders = await getOrdersByRestaurant(restaurantId, 'ordered');
      const ordersPerDay: { [key: string]: number } = {};
      orders.forEach((order: any) => {
        const date = dayjs(order.created_at).format('YYYY-MM-DD');
        ordersPerDay[date] = (ordersPerDay[date] || 0) + 1;
      });
      const formattedData = Object.entries(ordersPerDay).map(([date, value]) => ({
        date,
        value,
      }));
      setChartData(formattedData);
    }
    fetchOrders();
  }, [restaurantId]);

  return (
    <Box>
      <DailyOrders data={chartData} />
    </Box>
  );
};

export default DashboardDO;
