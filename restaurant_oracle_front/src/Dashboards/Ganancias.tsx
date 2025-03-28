"use client";

import { Box, Heading } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";

interface RevenueEntry {
  date: string;
  profit: number;
}

const DailyProfit = ({ data }: { data: RevenueEntry[] }) => {
  return (
    <ResponsiveContainer width="99%" height={300}>
      <LineChart data={data} margin={{ top: 20, right: 10, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="date"
          fontSize={12}
          tickFormatter={(value) => dayjs(value).format("MM/DD")}
        />
        <YAxis
          fontSize={12}
          tickFormatter={(value) => `$${(Number(value) / 1000).toFixed(1)}k`}
        />
        <Tooltip
          formatter={(value: number) =>
            new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
            }).format(value)
          }
          labelFormatter={(label) => `Ganancia - ${dayjs(label).format("MMM D, YYYY")}`}
        />
        <Line type="monotone" dataKey="profit" stroke="#4CAF50" strokeWidth={2} name="Ganancia" />
      </LineChart>
    </ResponsiveContainer>
  );
};

const PaginaGanancia: React.FC = () => {
  const [data, setData] = useState<RevenueEntry[]>([]);

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("history") || "[]");
    const recetas = JSON.parse(localStorage.getItem("recetasPlatos") || "[]");
    const inventario = JSON.parse(localStorage.getItem("alimentosGuardados") || "[]");

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
      const date = dayjs(order.timestamp).format("YYYY-MM-DD");
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
      profit: revenue - cost,
    }));

    setData(formatted);
  }, []);

  return (
    <Box p={6} bg="gray.100" minH="100vh">
      <Heading textAlign="center" mb={6}>📈 Ganancia Diaria</Heading>
      <Box bg="white" p={4} borderRadius="md" boxShadow="md">
        <DailyProfit data={data} />
      </Box>
    </Box>
  );
};

export default PaginaGanancia;