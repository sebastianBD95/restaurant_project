"use client";

import { Box, Heading, Text, Button, VStack, Grid } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RestaurantLayout from "./RestaurantLayout";

const Ordenes: React.FC = () => {
  const [orders, setOrders] = useState(
    [] as {
      table: string;
      items: any[];
      observations: string;
      timestamp: string;
      paid: boolean;
      status: string;
    }[]
  );
  const [checkedState, setCheckedState] = useState<boolean[]>([]);
  const navigate = useNavigate();

  const handleClick = (): void => {
    navigate("/pagina1");
  };

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    setOrders(storedOrders);
    setCheckedState(new Array(storedOrders.length).fill(false));
  }, []);

  const updateOrderStatus = (index: number, newStatus: string) => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    storedOrders[index].status = newStatus;
    localStorage.setItem("orders", JSON.stringify(storedOrders));
    setOrders([...storedOrders]);
    window.dispatchEvent(new Event("orderUpdated")); // 🔄 Actualiza RestaurantLayout
  };

  const markAsPaid = (index: number) => {
    const storedOrders = JSON.parse(localStorage.getItem("orders") || "[]");
    const paidOrder = storedOrders.splice(index, 1)[0];
    paidOrder.paid = true;
    paidOrder.status = "Pagado";

    const storedHistory = JSON.parse(localStorage.getItem("history") || "[]");
    localStorage.setItem("history", JSON.stringify([...storedHistory, paidOrder]));
    localStorage.setItem("orders", JSON.stringify(storedOrders));
    window.dispatchEvent(new Event("storage")); // 🔄 También dispara updateTables por compatibilidad
    setOrders(storedOrders);
  };

  return (
    <Box p={6} bg="gray.100" minH="100vh">
      <Heading textAlign="center" mb={6}>
        Pedidos Realizados
      </Heading>
      <Button color="orange" variant="subtle" size="md" h="45px" onClick={handleClick}>
        Inicio
      </Button>
      <Grid templateColumns={{ base: "3fr", md: "1fr 2fr" }} gap={6}>
        <Box bg="white" p={4} borderRadius="md" boxShadow="md" h="550px" overflowY="auto">
          {orders.length === 0 ? (
            <Text textAlign="center">No hay pedidos registrados.</Text>
          ) : (
            <VStack align="stretch">
              {orders.map((order, index) => (
                <Box key={index} bg="white" p={4} borderRadius="md" boxShadow="md">
                  <Heading size="md">Mesa {order.table}</Heading>
                  <Text fontSize="sm" color="gray.500">
                    Pedido realizado: {order.timestamp}
                  </Text>
                  {order.items.map((item, idx) => (
                    <Text key={idx}>
                      {item.quantity}x {item.name} - ${item.price * item.quantity} - {item.observation}
                    </Text>
                  ))}
                  {order.observations && (
                    <Text fontSize="sm" fontWeight="bold" mt={3} color="blue.600">
                      Observaciones: {order.observations}
                    </Text>
                  )}
                  <Text fontSize="md" fontWeight="bold" mt={3} color="purple.600">
                    Estado: {order.status || "En preparación"}
                  </Text>

                  {order.status !== "Entregado a la mesa"  && (
                    <Button
                      mt={2}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => updateOrderStatus(index, "Entregado a la mesa")}
                    >
                      Marcar como Entregado
                    </Button>
                  )}

                  {order.status === "Entregado a la mesa" && (
                    <Button
                      mt={2}
                      colorScheme="green"
                      size="sm"
                      onClick={() => markAsPaid(index)}
                    >
                      Marcar como Pagado
                    </Button>
                  )}
                </Box>
              ))}
            </VStack>
          )}
        </Box>

        <Box bg="white" p={4} borderRadius="md" boxShadow="md" h="550px" overflowY="auto">
          <Heading size="md" mb={4}>
            Distribución Mesas
          </Heading>
          <RestaurantLayout />
        </Box>
      </Grid>
    </Box>
  );
};

export default Ordenes;
