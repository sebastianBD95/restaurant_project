'use client';

import { Box, Heading, Text, Button, VStack, Grid, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableDistribution from '../../components/orders/TableComponent';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { getOrdersByRestaurant, updateOrderStatus as updateOrderStatusService } from '../../services/orderService';

const statusMap: Record<string, string> = {
  'ordered': 'Pedido',
  'delivered': 'Entregado a la mesa',
  'payed': 'Pagado',
  'canceled': 'Cancelado'
};

interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  observation: string;
}

interface Order {
  order_id: string;
  table_id: string;
  table: number;
  restaurant_id: string;
  items: OrderItem[];
  status: string;
  total_price: number;
}

const Ordenes: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [checkedState, setCheckedState] = useState<boolean[]>([]);
  const { restaurantId } = useParams();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

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

  useEffect(() => {
    fetchOrders();
  }, [restaurantId]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusService({
        order_id: orderId,
        status: newStatus
      });
      
      // Wait for the orders to be refreshed
      await fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
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
                  {orders
                    .filter(order => order.status !== 'payed' && order.status !== 'canceled')
                    .map((order) => (
                    <Box key={order.order_id} bg="white" p={{ base: 2, md: 4 }} borderRadius="md" boxShadow="md">
                      <Heading size="md">Mesa {order.table}</Heading>
                      <Text fontSize="sm" color="gray.500">
                        Total: ${order.total_price}
                      </Text>
                      {order.items.map((item, idx) => (
                        <Text key={idx}>
                          {item.quantity}x {item.name} - ${item.price * item.quantity}
                          {item.observation && ` - ${item.observation}`}
                        </Text>
                      ))}
                      <Text fontSize="md" fontWeight="bold" mt={3} color="purple.600">
                        Estado: {statusMap[order.status] || order.status}
                      </Text>

                      {order.status !== 'delivered' && (
                        <Button
                          mt={2}
                          colorScheme="blue"
                          size="sm"
                          onClick={() => updateOrderStatus(order.order_id, 'delivered')}
                        >
                          Marcar como Entregado
                        </Button>
                      )}

                      {order.status === 'delivered' && (
                        <Button mt={2} colorScheme="green" size="sm" onClick={() => updateOrderStatus(order.order_id, 'payed' )}>
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
