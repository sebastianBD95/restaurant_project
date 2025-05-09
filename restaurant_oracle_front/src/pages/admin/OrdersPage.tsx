'use client';

import { Box, Heading, Text, Button, VStack, Grid, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableDistribution from '../../components/orders/TableComponent';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { getOrdersByRestaurant, updateOrderStatus as updateOrderStatusService } from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import { getTables } from '../../services/tableService';
import { Table } from '../../interfaces/table';

const statusMap: Record<string, string> = {
  'ordered': 'Pedido',
  'delivered': 'Entregado a la mesa',
  'paid': 'Pagado',
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
  const [mesas, setMesas] = useState<Table[]>([]);

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

  const fetchTables = async () => {
    try {
      if (restaurantId) {
        const tables = await getTables(restaurantId);
        setMesas(tables);
      }
    } catch (error) {
      console.error('Error fetching tables:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchTables();
  }, [restaurantId]);

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatusService({
        order_id: orderId,
        status: newStatus
      });
      
      // Wait for the orders to be refreshed
      await fetchOrders();
      await fetchTables();
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
                    .filter(order => order.status !== 'paid' && order.status !== 'canceled')
                    .map(order => (
                      <OrderCard
                        key={order.order_id}
                        order={order}
                        onDeliver={orderId => updateOrderStatus(orderId, 'delivered')}
                        onPay={orderId => updateOrderStatus(orderId, 'paid')}
                        highlight={order.status === 'delivered'}
                      />
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
                <TableDistribution mesas={mesas} fetchTables={fetchTables} />
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>
    </Flex>
  );
};

export default Ordenes;
