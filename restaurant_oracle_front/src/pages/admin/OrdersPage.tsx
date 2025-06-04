'use client';

import { Box, Heading, Text, Button, VStack, Grid, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableDistribution from '../../components/orders/TableComponent';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { getOrdersByRestaurant, updateOrderStatus as updateOrderStatusService, addItemsToOrder, cancelOrderItem, createVoidOrderItem, getVoidOrders, updateOrderItem } from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import { toaster } from '../../components/ui/toaster';
import { getMenus } from '../../services/menuService';
import { MenuItemResponse } from '../../interfaces/menuItems';
import { useDisclosure } from '@chakra-ui/react';
import { getCookie } from '../utils/cookieManager';
import AddDishesDialog from '../../components/orders/AddDishesDialog';
import { Order, OrderItem, VoidOrderItem } from '../../interfaces/order';
import { useTables } from '../../hooks/useTables';
import VoidOrderItemCard from '../../components/orders/VoidOrderItemCard';

const statusMap: Record<string, string> = {
  'ordered': 'Pedido',
  'delivered': 'Entregado a la mesa',
  'paid': 'Pagado',
  'canceled': 'Cancelado'
};

const Ordenes: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [voidOrders, setVoidOrders] = useState<VoidOrderItem[]>([]);
  const { restaurantId } = useParams();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { tables: mesas, loading: tablesLoading, error: tablesError, fetchTables } = useTables(restaurantId);
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<{ [id: string]: number }>({});
  const { open, onOpen, onClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const fetchOrders = async () => {
    try {
      if (restaurantId) {
        const orders = await getOrdersByRestaurant(restaurantId,"ordered");
        setOrders(orders);
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error cargando pedidos.',
        type: 'error',
        duration: 5000,
      });
    }
  };

  const fetchVoidOrders = async () => {
    if (!restaurantId) return;
    const voidOrders = await getVoidOrders(restaurantId);
    setVoidOrders(voidOrders as VoidOrderItem[]);
  };

  const fetchMenuItems = async () => {
    if (!restaurantId) return;
    try {
      const token = getCookie(document.cookie, 'token');
      const items = await getMenus(token!, restaurantId);
      setMenuItems(items.filter(item => item.available && !item.hidden));
    } catch (error) {
      setMenuItems([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchVoidOrders();
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

  const voidOrderItem = async (orderId: string, menuItemId: string, observation: string) => {
    // TODO: Call backend to void the item, then refresh orders
    console.log('Void item', orderId, menuItemId);
    try {
      await createVoidOrderItem(orderId, menuItemId, restaurantId!, observation);
      await fetchOrders();
      await fetchTables();
      await fetchVoidOrders();
      toaster.create({
        title: 'Plato anulado',
        description: 'Plato anulado correctamente.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error voiding order item:', error);
    }
  };

  const cancelOrderItemAction = async (orderId: string, menuItemId: string, observation: string) => {
    console.log('Cancel item', orderId, menuItemId, observation);
    try {
      await cancelOrderItem(orderId,menuItemId, observation);
      await fetchOrders();
      await fetchTables();
      toaster.create({
        title: 'Plato anulado',
        description: 'Plato anulado correctamente.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo anular el plato.',
        type: 'error',
      });
      console.error('Error canceling order item:', error);
    }
  };

  const updateOrderItemAction = async (orderId: string, menuItemId: string, observation: string, status: string) => {
    console.log('Update item', orderId, menuItemId, observation, status);
    try {
      await updateOrderItem(orderId, menuItemId, observation, status);
      await fetchOrders();
      await fetchTables();
      toaster.create({
        title: 'Plato preparado',
        description: 'Plato preparado correctamente.',
        type: 'success',
      });
    } catch (error) {
      console.error('Error updating order item:', error);
    }
  };

  const handleAddDishesClick = (order: Order) => {
    setSelectedOrder(order);
    setSelectedDishes({});
    fetchMenuItems();
    onOpen();
  };

  const handleDishQuantityChange = (menu_item_id: string, quantity: number) => {
    if (!quantity || isNaN(quantity)) {
      setSelectedDishes(prev => {
        const updated = { ...prev };
        delete updated[menu_item_id];
        return updated;
      });
    } else {
      setSelectedDishes(prev => ({ ...prev, [menu_item_id]: quantity }));
    }
  };

  const handleAddDishesSubmit = async () => {
    console.log('selectedOrder', selectedOrder);
    console.log('selectedDishes', selectedDishes);
    if (!selectedOrder) return;
    const itemsToAdd = Object.entries(selectedDishes)
      .filter(([_, qty]) => qty > 0)
      .map(([menu_item_id, quantity]) => ({ menu_item_id, quantity }));
    if (itemsToAdd.length === 0) return;
    try {
      await addItemsToOrder(selectedOrder.order_id, itemsToAdd);
      toaster.create({
        title: 'Platos agregados',
        description: 'Platos agregados al pedido.',
        type: 'success',
      });
      onClose();
      setSelectedOrder(null);
      setSelectedDishes({});
      fetchOrders();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudieron agregar los platos.',
        type: 'error',
      });
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
            templateColumns={{ base: '1fr', md: '1fr 1fr' }} 
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
              <Heading size="md" mb={4}>Pedidos Activos</Heading>
              {orders.filter(order => order.status !== 'paid' && order.status !== 'canceled').length === 0 ? (
                <Text textAlign="center">No hay pedidos registrados.</Text>
              ) : (
                <VStack align="stretch" gap={4}>
                  {orders
                    .filter(order => order.status !== 'paid' && order.status !== 'canceled')
                    .map(order => (
                      <Box key={order.order_id} mb={4}>
                        <OrderCard
                          order={order}
                          onDeliver={orderId => updateOrderStatus(orderId, 'delivered')}
                          onPay={orderId => updateOrderStatus(orderId, 'paid')}
                          highlight={order.status === 'delivered'}
                          onVoidItem={voidOrderItem}
                          onCancelItem={cancelOrderItemAction}
                          onUpdateOrderItem={updateOrderItemAction}
                          onAddDishes={() => handleAddDishesClick(order)}
                        />
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
              overflowY="auto"
              minW={0}
            >
              <Heading size="md" mb={4}>Pedidos Anulados</Heading>
              {voidOrders.length === 0 ? (
                <Text textAlign="center">No hay pedidos anulados.</Text>
              ) : (
                <VStack align="stretch" gap={4}>
                    {voidOrders.map(item => (
                      <VoidOrderItemCard
                        key={item.menu_item_id + (item.created_at || '')}
                        item={item}
                      />
                    ))}
                </VStack>
              )}
            </Box>
          </Grid>

          <Box 
            bg="white" 
            p={{ base: 2, md: 4 }} 
            borderRadius="md" 
            boxShadow="md" 
            mt={6}
            overflowX="auto" 
            overflowY="auto"
            minW={0}
          >
            
            
          <TableDistribution mesas={mesas} fetchTables={fetchTables} />
          
          </Box>
        </Box>
      </Box>

      <AddDishesDialog
        open={open}
        onClose={onClose}
        menuItems={menuItems}
        categories={categories}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        selectedDishes={selectedDishes}
        handleDishQuantityChange={handleDishQuantityChange}
        handleAddDishesSubmit={handleAddDishesSubmit}
      />
    </Flex>
  );
};

export default Ordenes;
