'use client';

import { Box, Heading, Text, Button, VStack, Grid, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableDistribution from '../../components/orders/TableComponent';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { getOrdersByRestaurant, updateOrderStatus as updateOrderStatusService, addItemsToOrder } from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import { getTables } from '../../services/tableService';
import { Table } from '../../interfaces/table';
import { toaster } from '../../components/ui/toaster';
import { getMenus } from '../../services/menuService';
import { MenuItemResponse } from '../../interfaces/menuItems';
import { DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../../components/ui/dialog';
import { NumberInputRoot, NumberInputField } from '../../components/ui/number-input';
import { useDisclosure } from '@chakra-ui/react';
import { getCookie } from '../utils/cookieManager';

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
  status: string;
  observation: string;
  image?: string;
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
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<{ [id: string]: number }>({});
  const { open, onOpen, onClose } = useDisclosure();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const categories = Array.from(new Set(menuItems.map(item => item.category)));

  const fetchOrders = async () => {
    try {
      if (restaurantId) {
        const orders = await getOrdersByRestaurant(restaurantId);
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

  const fetchTables = async () => {
    try {
      if (restaurantId) {
        const tables = await getTables(restaurantId);
        setMesas(tables);
      }
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error cargando mesas.',
        type: 'error',
        duration: 5000,
      });
    }
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

  const voidOrderItem = (orderId: string, menuItemId: string) => {
    // TODO: Call backend to void the item, then refresh orders
    console.log('Void item', orderId, menuItemId);
  };

  const cancelOrderItem = (orderId: string, menuItemId: string) => {
    // TODO: Call backend to cancel the item, then refresh orders
    console.log('Cancel item', orderId, menuItemId);
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
                          onCancelItem={cancelOrderItem}
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
              {orders.filter(order => order.status === 'canceled').length === 0 ? (
                <Text textAlign="center">No hay pedidos anulados.</Text>
              ) : (
                <VStack align="stretch" gap={4}>
                  {orders
                    .filter(order => order.status === 'canceled')
                    .map(order => (
                      <OrderCard
                        key={order.order_id}
                        order={order}
                        onDeliver={() => {}}
                        onPay={() => {}}
                        highlight={false}
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

      <DialogRoot open={open} onOpenChange={open => { if (!open) onClose(); }}>
        <DialogContent>
          <DialogHeader>Agregar Platos al Pedido</DialogHeader>
          <DialogBody>
            {categories.length > 0 && (
              <Box mb={4}>
                <Text mb={1}>Categoría</Text>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  style={{ width: '100%', padding: '8px', borderRadius: '4px' }}
                >
                  <option value="">Selecciona una categoría</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </Box>
            )}

            {menuItems.length === 0 ? (
              <Text>No hay platos disponibles.</Text>
            ) : (
              menuItems
                .filter(item => item.category === selectedCategory)
                .map(item => (
                  <Box key={item.menu_item_id} display="flex" alignItems="center" mb={2}>
                    <Text flex={1}>{item.name} (${item.price})</Text>
                    <NumberInputRoot min={0} max={99} width="80px" value={selectedDishes[item.menu_item_id]?.toString() || ''} onValueChange={({ value }) => handleDishQuantityChange(item.menu_item_id, Number(value))}>
                      <NumberInputField />
                    </NumberInputRoot>
                  </Box>
                ))
            )}
          </DialogBody>
          <DialogFooter>
            <Button colorScheme="blue" mr={3} onClick={handleAddDishesSubmit}>Agregar</Button>
            <Button onClick={onClose}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </Flex>
  );
};

export default Ordenes;
