"use client";

import React, { useEffect, useState } from "react";
import { Box, Heading, Button } from "@chakra-ui/react";
import { Stage, Layer, Rect, Circle, Text, Group } from "react-konva";

interface Mesa {
  id: string;
  x: number;
  y: number;
  shape: "rect" | "circle";
  isOccupied: boolean;
  isProcessingPayment: boolean;
}

const generateMesas = (): Mesa[] => {
  return [...Array(20)].map((_, i) => ({
    id: String(i + 1),
    x: 100 + (i % 5) * 100,
    y: 100 + Math.floor(i / 5) * 100,
    shape: "rect",
    isOccupied: false,
    isProcessingPayment: false,
  }));
};

const RestaurantLayout: React.FC = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);

  useEffect(() => {
    const savedLayout = localStorage.getItem("mesasLayout");
    if (savedLayout) {
      setMesas(JSON.parse(savedLayout));
    } else {
      setMesas(generateMesas());
    }
  }, []);

  useEffect(() => {
    if (mesas.length > 0) {
      localStorage.setItem("mesasLayout", JSON.stringify(mesas));
    }
  }, [mesas]);

  useEffect(() => {
    const updateTables = () => {
      const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");

      const occupiedTables = storedOrders.map((order: any) =>
        order.table.toString()
      );

      const processingTables = storedOrders
        .filter((order: any) => order.status === "Entregado a la mesa")
        .map((order: any) => order.table.toString());

      setMesas((prevMesas) =>
        prevMesas.map((mesa) => ({
          ...mesa,
          isOccupied: occupiedTables.includes(mesa.id),
          isProcessingPayment: processingTables.includes(mesa.id),
        }))
      );
    };

    updateTables();
    window.addEventListener("storage", updateTables);
    return () => window.removeEventListener("storage", updateTables);
  }, []);

  useEffect(() => {
    const handleStatusChange = () => {
      window.dispatchEvent(new Event("storage"));
    };
    window.addEventListener("orderUpdated", handleStatusChange);
    return () => window.removeEventListener("orderUpdated", handleStatusChange);
  }, []);

  const handleDragEnd = (e: any, id: string) => {
    if (isLocked) return;
    const newX = e.target.x();
    const newY = e.target.y();
    setMesas((prevMesas) =>
      prevMesas.map((mesa) =>
        mesa.id === id ? { ...mesa, x: newX, y: newY } : mesa
      )
    );
  };

  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  const toggleShape = (id: string) => {
    setMesas(
      mesas.map((mesa) =>
        mesa.id === id
          ? { ...mesa, shape: mesa.shape === "rect" ? "circle" : "rect" }
          : mesa
      )
    );
  };

  const getMesaColor = (mesa: Mesa): string => {
    if (mesa.isProcessingPayment) return "yellow";
    if (mesa.isOccupied) return "red";
    return "green";
  };

  return (
    <Box bg="white" p={4} borderRadius="md" boxShadow="md" h="650px">
      <Heading size="md" mb={4} textAlign="center">
        📍 Distribución de Mesas
      </Heading>
      <Button
        onClick={toggleLock}
        mb={4}
        colorScheme={isLocked ? "red" : "blue"}
      >
        {isLocked ? "Desbloquear Organización" : "Bloquear Organización"}
      </Button>
      <Stage width={700} height={500} style={{ border: "2px solid black" }}>
        <Layer>
          <Text
            text="Arrastra las mesas y haz clic para cambiar su forma"
            x={10}
            y={10}
          />
          {mesas.map((mesa) => (
            <Group
              key={mesa.id}
              draggable={!isLocked}
              x={mesa.x}
              y={mesa.y}
              onClick={() => toggleShape(mesa.id)}
              onDragEnd={(e) => handleDragEnd(e, mesa.id)}
            >
              {mesa.shape === "rect" ? (
                <Rect
                  id={mesa.id}
                  width={60}
                  height={60}
                  fill={getMesaColor(mesa)}
                  shadowBlur={5}
                />
              ) : (
                <Circle
                  id={mesa.id}
                  radius={30}
                  fill={getMesaColor(mesa)}
                  shadowBlur={5}
                />
              )}
              <Text
                text={mesa.id}
                fontSize={14}
                fill="white"
                fontStyle="bold"
                align="center"
                verticalAlign="middle"
                x={mesa.shape === "rect" ? 20 : -5}
                y={mesa.shape === "rect" ? 20 : -5}
                width={mesa.shape === "rect" ? 20 : 10}
                height={20}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </Box>
  );
};

export default RestaurantLayout;
