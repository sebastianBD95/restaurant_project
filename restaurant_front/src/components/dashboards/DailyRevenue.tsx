'use client';

import { Box, Heading } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import { Tooltip, ResponsiveContainer, XAxis, YAxis, AreaChart, Area } from 'recharts';

interface RevenueEntry {
  date: string;
  revenue: number;
  cost: number;
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

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('history') || '[]');
    const recetas = JSON.parse(localStorage.getItem('recetasPlatos') || '[]');
    const inventario = JSON.parse(localStorage.getItem('alimentosGuardados') || '[]');

    const recetaMap: Record<string, { alimentoId: string; cantidad: number }[]> = {};
    recetas.forEach((r: any) => {
      recetaMap[r.nombre] = r.ingredientes;
    });

    const alimentoCostoMap: Record<string, number> = {};
    inventario.forEach((a: any) => {
      alimentoCostoMap[a.id] = a.costoUnitario || 0;
    });

    const daily: Record<string, { revenue: number; cost: number }> = {};

    storedOrders.forEach((order: any) => {
      const date = dayjs(order.timestamp).format('YYYY-MM-DD');
      let totalRevenue = 0;
      let totalCost = 0;

      order.items.forEach((item: any) => {
        const receta = recetaMap[item.name] || [];
        const costoPlato = receta.reduce((sum, ing) => {
          const costoUnit = alimentoCostoMap[ing.alimentoId] || 0;
          return sum + ing.cantidad * costoUnit;
        }, 0);

        totalRevenue += item.price * item.quantity;
        totalCost += costoPlato * item.quantity;
      });

      if (!daily[date]) daily[date] = { revenue: 0, cost: 0 };
      daily[date].revenue += totalRevenue;
      daily[date].cost += totalCost;
    });

    const formatted: RevenueEntry[] = Object.entries(daily).map(([date, { revenue, cost }]) => ({
      date,
      revenue,
      cost,
    }));

    setRevenueData(formatted);
  }, []);

  return (
    <Box>
      <DailyRevenue data={revenueData} />
    </Box>
  );
};

export default PaginaIngresos;
