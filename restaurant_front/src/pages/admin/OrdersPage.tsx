'use client';

import { Box, Heading, Text, VStack, Grid, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import TableDistribution from '../../components/orders/TableComponent';
import { ResponsiveSidebar } from '../../components/ui/ResponsiveSidebar';
import { useResponsive } from '../../hooks/useResponsive';
import {
  getOrdersByRestaurant,
  updateOrderStatus as updateOrderStatusService,
  addItemsToOrder,
  cancelOrderItem,
  createVoidOrderItem,
  getVoidOrders,
  updateOrderItem,
  recoverVoidOrderItem,
} from '../../services/orderService';
import OrderCard from '../../components/orders/OrderCard';
import { toaster } from '../../components/ui/toaster';
import { getMenus } from '../../services/menuService';
import { MenuItemResponse } from '../../interfaces/menuItems';
import { useDisclosure } from '@chakra-ui/react';
import { getCookie } from '../utils/cookieManager';
import AddDishesDialog from '../../components/orders/AddDishesDialog';
import { Order, VoidOrderItem, OrderStatusUpdate, OrderItem } from '../../interfaces/order';
import { useTables } from '../../hooks/useTables';
import VoidOrderItemCard from '../../components/orders/VoidOrderItemCard';
import RecoverVoidItemDialog from '../../components/orders/RecoverVoidItemDialog';

const statusMap: Record<string, string> = {
  ordered: 'Pedido',
  delivered: 'Entregado a la mesa',
  paid: 'Pagado',
  canceled: 'Cancelado',
};

const Ordenes: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [voidOrders, setVoidOrders] = useState<VoidOrderItem[]>([]);
  const { restaurantId } = useParams();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const {
    tables: mesas,
    loading: tablesLoading,
    error: tablesError,
    fetchTables,
  } = useTables(restaurantId);
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedDishes, setSelectedDishes] = useState<{ [id: string]: number }>({});
  const { open, onOpen, onClose } = useDisclosure();
  const [isRecoverDialogOpen, setIsRecoverDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedVoidItem, setSelectedVoidItem] = useState<VoidOrderItem | null>(null);
  const categories = Array.from(new Set(menuItems.map((item) => item.category)));

  const fetchOrders = async () => {
    try {
      if (restaurantId) {
        const orders = await getOrdersByRestaurant(restaurantId, 'ordered');
        const ordersPrepared = await getOrdersByRestaurant(restaurantId, 'prepared');
        const ordersDelivered = await getOrdersByRestaurant(restaurantId, 'delivered');

        setOrders(orders.concat(ordersPrepared).concat(ordersDelivered));
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
    console.log('Void orders', voidOrders);
    setVoidOrders(voidOrders as VoidOrderItem[]);
  };

  const fetchMenuItems = async () => {
    if (!restaurantId) return;
    try {
      const token = getCookie(document.cookie, 'token');
      const items = await getMenus(token!, restaurantId);
      setMenuItems(items.filter((item) => item.available && !item.hidden));
    } catch (error) {
      setMenuItems([]);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchTables();
    fetchVoidOrders();
  }, [restaurantId]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatusUpdate) => {
    try {
      await updateOrderStatusService(orderId, newStatus);
      await fetchOrders();
      toaster.create({
        title: 'Estado actualizado',
        description: 'Estado del pedido actualizado correctamente.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo actualizar el estado del pedido.',
        type: 'error',
      });
    }
  };

  const voidOrderItem = async (orderId: string, menuItemId: string, quantity: number) => {
    try {
      await createVoidOrderItem(orderId, menuItemId, quantity);
      await fetchOrders();
      await fetchVoidOrders();
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
    }
  };

  const cancelOrderItemAction = async (orderId: string, menuItemId: string, quantity: number) => {
    try {
      await cancelOrderItem(orderId, menuItemId, quantity);
      await fetchOrders();
      toaster.create({
        title: 'Plato cancelado',
        description: 'Plato cancelado correctamente.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo cancelar el plato.',
        type: 'error',
      });
    }
  };

  const updateOrderItemAction = async (orderId: string, menuItemId: string, quantity: number) => {
    try {
      await updateOrderItem(orderId, menuItemId, quantity);
      await fetchOrders();
      toaster.create({
        title: 'Plato actualizado',
        description: 'Plato actualizado correctamente.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo actualizar el plato.',
        type: 'error',
      });
    }
  };

  const handleRecoverClick = (voidItem: VoidOrderItem) => {
    // Check if the void item is within the 20-minute window
    if (voidItem.created_at) {
      const createdAt = new Date(voidItem.created_at);
      const now = new Date();
      const timeDiff = now.getTime() - createdAt.getTime();
      const minutesDiff = Math.floor(timeDiff / (1000 * 60));

      if (minutesDiff > 20) {
        toaster.create({
          title: 'Tiempo Expirado',
          description: 'Este plato ya no puede ser recuperado (más de 20 minutos).',
          type: 'error',
        });
        return;
      }
    }

    setSelectedVoidItem(voidItem);
    setIsRecoverDialogOpen(true);
  };

  const recoverVoidOrderItemAction = async (voidOrderItemId: string, targetOrderId: string) => {
    console.log('Recover void item', voidOrderItemId, targetOrderId);
    console.log('Available orders', orders);
    try {
      await recoverVoidOrderItem(voidOrderItemId, targetOrderId);
      await fetchOrders();
      await fetchVoidOrders();
      toaster.create({
        title: 'Plato recuperado',
        description: 'Plato recuperado correctamente.',
        type: 'success',
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo recuperar el plato.',
        type: 'error',
      });
      console.error('Error recovering void order item:', error);
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
      setSelectedDishes((prev) => {
        const updated = { ...prev };
        delete updated[menu_item_id];
        return updated;
      });
    } else {
      setSelectedDishes((prev) => ({ ...prev, [menu_item_id]: quantity }));
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
      await addItemsToOrder(selectedOrder.order_id, itemsToAdd as OrderItem[]);
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
    <div className="page-wrapper">
      <Flex height={{ base: 'auto', md: '100vh' }} direction={{ base: 'column', md: 'row' }}>
        <ResponsiveSidebar restaurantId={restaurantId} />

        <Box 
          flex={1} 
          p={{ base: 2, sm: 3, md: 4, lg: 6 }} 
          overflowY="auto" 
          minW={0}
          ml={{ base: 0, md: 0 }}
        >
          <Box 
            p={{ base: 2, sm: 3, md: 6, lg: 8 }} 
            bg="gray.100" 
            minH={{ base: 'auto', md: '100vh' }}
            borderRadius={{ base: 'none', md: 'md' }}
          >
            <Heading 
              textAlign="center" 
              mb={{ base: 4, md: 6, lg: 8 }} 
              fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
              color="gray.800"
            >
              Pedidos Realizados
            </Heading>
            <Grid
              templateColumns={{ base: '1fr', md: '1fr 1fr' }}
              gap={{ base: 3, md: 4, lg: 6 }}
              alignItems="stretch"
            >
              <Box
                bg="white"
                p={{ base: 2, sm: 3, md: 4, lg: 6 }}
                borderRadius={{ base: 'sm', md: 'md', lg: 'lg' }}
                boxShadow={{ base: 'sm', md: 'md', lg: 'lg' }}
                h={{ base: 'auto', md: '550px' }}
                overflowY="auto"
                minW={0}
              >
                <Heading 
                  size={{ base: 'sm', md: 'md', lg: 'lg' }} 
                  mb={{ base: 2, md: 3, lg: 4 }}
                  fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                >
                  Pedidos Activos
                </Heading>
                {orders.filter((order) => order.status !== 'paid' && order.status !== 'canceled')
                  .length === 0 ? (
                  <Text 
                    textAlign="center"
                    fontSize={{ base: 'sm', md: 'md' }}
                  >
                    No hay pedidos registrados.
                  </Text>
                ) : (
                  <VStack align="stretch" gap={{ base: 2, md: 3, lg: 4 }}>
                    {orders
                      .filter((order) => order.status !== 'paid' && order.status !== 'canceled')
                      .map((order) => (
                        <Box key={order.order_id} mb={{ base: 2, md: 3, lg: 4 }}>
                          <OrderCard
                            order={order}
                            onUpdateOrder={updateOrderStatus}
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
                p={{ base: 2, sm: 3, md: 4, lg: 6 }}
                borderRadius={{ base: 'sm', md: 'md', lg: 'lg' }}
                boxShadow={{ base: 'sm', md: 'md', lg: 'lg' }}
                h={{ base: 'auto', md: '550px' }}
                overflowY="auto"
                minW={0}
              >
                <Heading 
                  size={{ base: 'sm', md: 'md', lg: 'lg' }} 
                  mb={{ base: 2, md: 3, lg: 4 }}
                  fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
                >
                  Pedidos Anulados
                </Heading>
                {voidOrders.length === 0 ? (
                  <Text 
                    textAlign="center"
                    fontSize={{ base: 'sm', md: 'md' }}
                  >
                    No hay pedidos anulados.
                  </Text>
                ) : (
                  <VStack align="stretch" gap={{ base: 2, md: 3, lg: 4 }}>
                    {voidOrders.map((item) => (
                      <VoidOrderItemCard
                        key={item.void_order_item_id || item.menu_item_id + (item.created_at || '')}
                        item={item}
                        onRecoverClick={handleRecoverClick}
                        availableOrders={orders
                          .filter((order) => order.status !== 'paid' && order.status !== 'canceled')
                          .map((order) => ({ order_id: order.order_id, table: order.table }))}
                      />
                    ))}
                  </VStack>
                )}
              </Box>
            </Grid>

            <Box
              bg="white"
              p={{ base: 2, sm: 3, md: 4, lg: 6 }}
              borderRadius={{ base: 'sm', md: 'md', lg: 'lg' }}
              boxShadow={{ base: 'sm', md: 'md', lg: 'lg' }}
              mt={{ base: 4, md: 5, lg: 6 }}
              overflowX="auto"
              overflowY="auto"
              minW={0}
            >
              <TableDistribution mesas={mesas} fetchTables={fetchTables} />
            </Box>
          </Box>
        </Box>
      </Flex>

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

      <RecoverVoidItemDialog
        isOpen={isRecoverDialogOpen}
        onClose={() => {
          setIsRecoverDialogOpen(false);
          setSelectedVoidItem(null);
        }}
        voidItem={selectedVoidItem}
        availableOrders={orders
          .filter((order) => order.status !== 'paid' && order.status !== 'canceled')
          .map((order) => ({ order_id: order.order_id, table: order.table }))}
        onRecover={recoverVoidOrderItemAction}
      />
    </div>
  );
};

export default Ordenes;
