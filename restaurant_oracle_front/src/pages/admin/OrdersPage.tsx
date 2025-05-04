'use client';

import { Box, Heading, Text, Button, VStack, Grid, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableDistribution from '../../components/orders/TableComponent';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { getOrdersByRestaurant } from '../../services/orderService';

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
  const { restaurantId } = useParams();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (restaurantId) {
          const orders = await getOrdersByRestaurant(restaurantId);
          setOrders(orders);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, [restaurantId]);

  const updateOrderStatus = (index: number, newStatus: string) => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    storedOrders[index].status = newStatus;
    localStorage.setItem('orders', JSON.stringify(storedOrders));
    setOrders([...storedOrders]);
    window.dispatchEvent(new Event('orderUpdated'));
  };

  const markAsPaid = (index: number) => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const paidOrder = storedOrders.splice(index, 1)[0];
    paidOrder.paid = true;
    paidOrder.status = 'Pagado';

    const storedHistory = JSON.parse(localStorage.getItem('history') || '[]');
    localStorage.setItem('history', JSON.stringify([...storedHistory, paidOrder]));
    localStorage.setItem('orders', JSON.stringify(storedOrders));
    window.dispatchEvent(new Event('storage'));
    setOrders(storedOrders);
  };

  return (
    <Flex height={{ base: 'auto', md: '100vh' }} direction={{ base: 'column', md: 'row' }}>
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        restaurantId={restaurantId}
      />

      <Box flex={1} p={{ base: 2, md: 6 }} overflowY="auto" minW={0}>
        <Box p={{ base: 2, md: 8 }} bg="gray.100" minH={{ base: 'auto', md: '100vh' }}>
          <Heading textAlign="center" mb={6} fontSize={{ base: 'xl', md: '2xl' }}>
            Pedidos Realizados
          </Heading>
          <Grid 
            templateColumns={{ base: '1fr', md: '1fr 2fr' }} 
            gap={{ base: 4, md: 6 }}
            alignItems="stretch"
          >
            <Box 
              bg="white" 
              p={{ base: 2, md: 4 }} 
              borderRadius="md" 
              boxShadow="md" 
              h={{ base: 'auto', md: '550px' }} 
              overflowY="auto"
              minW={0}
            >
              {orders.length === 0 ? (
                <Text textAlign="center">No hay pedidos registrados.</Text>
              ) : (
                <VStack align="stretch" gap={4}>
                  {orders.map((order, index) => (
                    <Box key={index} bg="white" p={{ base: 2, md: 4 }} borderRadius="md" boxShadow="md">
                      <Heading size="md">Mesa {order.table}</Heading>
                      <Text fontSize="sm" color="gray.500">
                        Pedido realizado: {order.timestamp}
                      </Text>
                      {order.items.map((item, idx) => (
                        <Text key={idx}>
                          {item.quantity}x {item.name} - ${item.price * item.quantity} -{' '}
                          {item.observation}
                        </Text>
                      ))}
                      {order.observations && (
                        <Text fontSize="sm" fontWeight="bold" mt={3} color="blue.600">
                          Observaciones: {order.observations}
                        </Text>
                      )}
                      <Text fontSize="md" fontWeight="bold" mt={3} color="purple.600">
                        Estado: {order.status || 'En preparación'}
                      </Text>

                      {order.status !== 'Entregado a la mesa' && (
                        <Button
                          mt={2}
                          colorScheme="blue"
                          size="sm"
                          onClick={() => updateOrderStatus(index, 'Entregado a la mesa')}
                        >
                          Marcar como Entregado
                        </Button>
                      )}

                      {order.status === 'Entregado a la mesa' && (
                        <Button mt={2} colorScheme="green" size="sm" onClick={() => markAsPaid(index)}>
                          Marcar como Pagado
                        </Button>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
            </Box>

            <Box 
              bg="white" 
              p={{ base: 2, md: 4 }} 
              borderRadius="md" 
              boxShadow="md" 
              h={{ base: 'auto', md: '550px' }} 
              overflowX="auto" 
              overflowY="auto"
              minW={0}
            >
              <Heading size="md" mb={4}>
                Distribución Mesas
              </Heading>
              <Box minW={{ base: '320px', md: 'auto' }}>
                <TableDistribution />
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>
    </Flex>
  );
};

export default Ordenes;
