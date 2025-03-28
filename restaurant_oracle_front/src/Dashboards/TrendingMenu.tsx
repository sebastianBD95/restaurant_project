"use client";

import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { useEffect, useState } from "react";
import { Icon } from "@chakra-ui/react"
import { PiStarThin } from "react-icons/pi";
import { IoTriangle } from "react-icons/io5";
import type { ReactNode } from "react";


interface ITrendingProduct {
  id: number;
  name: string;
  image: string;
  orderCount: number;
}

 const TrendingMenu: React.FC = () => {
  const [trending, setTrending] = useState<ITrendingProduct[]>([]);

  useEffect(() => {
    // Obtener los pedidos del historial
    const storedOrders = JSON.parse(localStorage.getItem("history") || "[]");

    // 📌 Contar cuántas veces se ha ordenado cada plato
    const dishCount: { [key: string]: { name: string; image: string; orderCount: number } } = {};

    storedOrders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (!dishCount[item.id]) {
          dishCount[item.id] = { name: item.name, image: item.image, orderCount: 0 };
        }
        dishCount[item.id].orderCount += item.quantity;
      });
    });

    // 📌 Convertir el objeto a un array y ordenar por número de pedidos
    const sortedDishes = Object.entries(dishCount)
      .map(([id, data]) => ({ id: Number(id), ...data }))
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 5); // Tomar solo los 5 más pedidos

    setTrending(sortedDishes);
  }, []);

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h5" fontWeight="bold" textAlign="center">
        🔥 Platos Más Populares
      </Typography>
      {trending.length === 0 ? (
        <Typography color="text.secondary" textAlign="center">
          No hay pedidos registrados.
        </Typography>
      ) : (
        trending.map((item, index) => (
          <Stack key={item.id} direction="row" alignItems="center" spacing={3} paddingY={1}>
            <Box sx={{ position: "relative" }}>
              <Avatar
                sx={{
                  width: 72,
                  height: 72,
                }}
                src={item.image} // Muestra la imagen del plato
              />
              <Box sx={{ position: "absolute", top: -10, right: -10 }}>
                {RankIcons[index + 1]} {/*  Icono de ranking */}
              </Box>
            </Box>
            <Stack spacing={"4px"}>
              <Typography variant="h6">{item.name}</Typography>
              <Typography color="text.secondary" whiteSpace="nowrap">
                Ordenado{" "}
                <Typography component="span" color="text.primary" whiteSpace="nowrap">
                  {item.orderCount}
                </Typography>{" "}
                veces
              </Typography>
            </Stack>
          </Stack>
        ))
      )}
    </Stack>
  );
};

// Iconos de ranking para el top 5 con Chakra UI
const RankIcons: Record<number, ReactNode> = {
  1: <Icon as={PiStarThin} color="yellow.400" boxSize={6} />, // Oro
  2: <Icon as={PiStarThin} color="gray.400" boxSize={5} />,   // Plata
  3: <Icon as={PiStarThin} color="orange.400" boxSize={5} />, // Bronce
  4: <Icon as={IoTriangle} color="teal.400" boxSize={4} />, // Otros
  5: <Icon as={IoTriangle} color="purple.400" boxSize={4} />,
};

export default TrendingMenu;