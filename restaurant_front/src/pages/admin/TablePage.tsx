'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  Badge,
  Button,
  Flex,
  Icon,
  Spinner,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogCloseTrigger,
} from '../../components/ui/dialog';
import {
  Alert,
} from '@chakra-ui/react';
import {
  FiUsers,
  FiClock,
  FiCreditCard,
  FiSmartphone,
  FiCheckCircle,
} from 'react-icons/fi';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { useTables } from '../../hooks/useTables';
import { toaster } from '../../components/ui/toaster';
import { Table } from '../../interfaces/table';
import { getOrdersByRestaurant } from '../../services/orderService';

// Status configurations
const TABLE_STATUS_CONFIG = {
  available: {
    label: 'Disponible',
    color: 'green',
    icon: FiCheckCircle,
    description: 'Mesa libre para nuevos clientes',
  },
  occupied: {
    label: 'Ocupada',
    color: 'blue',
    icon: FiUsers,
    description: 'Mesa en uso por clientes',
  },
  reserved: {
    label: 'Reservada',
    color: 'yellow',
    icon: FiClock,
    description: 'Mesa reservada para más tarde',
  },
} as const;

const ORDER_STATUS_CONFIG = {
  ordered: {
    label: 'Pedido',
    color: 'orange',
  },
  prepared: {
    label: 'Preparado',
    color: 'blue',
  },
  delivered: {
    label: 'Entregado',
    color: 'green',
  },
  paid: {
    label: 'Pagado',
    color: 'green',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'red',
  },
} as const;

const ITEM_STATUS_CONFIG = {
  pending: {
    label: 'Pendiente',
    color: 'yellow',
  },
  completed: {
    label: 'Completado',
    color: 'green',
  },
  cancelled: {
    label: 'Cancelado',
    color: 'red',
  },
  prepared: {
    label: 'Preparado',
    color: 'blue',
  },
  delivered: {
    label: 'Entregado',
    color: 'green',
  },
} as const;

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
  time_to_prepare: number;
  time_to_deliver: number;
  time_to_pay: number;
  created_at: string;
}

interface TableWithOrders extends Table {
  currentOrder?: Order;
  paymentStatus?: 'pending' | 'paid' | 'partial';
  estimatedDuration?: number;
}

interface GooglePayConfig {
  merchantId: string;
  environment: 'TEST' | 'PRODUCTION';
  paymentMethods: string[];
  currencyCode: string;
}

const TablePage: React.FC = () => {
  const { restaurantId, tableId } = useParams<{ restaurantId: string; tableId: string }>();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { tables, loading, error, fetchTables } = useTables(restaurantId);
  const [tableWithOrder, setTableWithOrder] = useState<TableWithOrders | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [showGooglePayModal, setShowGooglePayModal] = useState(false);

  // Google Pay configuration (placeholder for future integration)
  const googlePayConfig: GooglePayConfig = {
    merchantId: process.env.REACT_APP_GOOGLE_PAY_MERCHANT_ID || 'your-merchant-id',
    environment: process.env.NODE_ENV === 'production' ? 'PRODUCTION' : 'TEST',
    paymentMethods: ['CARD', 'TOKENIZED_CARD'],
    currencyCode: 'COP',
  };

  useEffect(() => {
    if (restaurantId && tableId) {
      fetchTables();
    }
  }, [restaurantId, tableId]);

  useEffect(() => {
    if (tables.length > 0 && tableId) {
      fetchTableOrder();
    }
  }, [tables, tableId]);

  const fetchTableOrder = async () => {
    if (!restaurantId || !tableId) return;

    setLoadingOrders(true);
    try {
      // Find the specific table
      const table = tables.find(t => t.table_id === tableId || t.table_number.toString() === tableId);
      
      if (!table) {
        toaster.create({
          title: 'Error',
          description: 'Mesa no encontrada.',
          type: 'error',
          duration: 5000,
        });
        return;
      }

      // Fetch orders with "ordered" status
      const orderedOrders = await getOrdersByRestaurant(restaurantId, "ordered",table.table_id);
      const preparedOrders = await getOrdersByRestaurant(restaurantId, "prepared",table.table_id);
      const deliveredOrders = await getOrdersByRestaurant(restaurantId, "delivered",table.table_id);
      // Find order for this specific table
      const tableOrder = orderedOrders.find(
        (order: Order) => order.table === table.table_number
      );
      const preparedOrder = preparedOrders.find(
        (order: Order) => order.table === table.table_number
      );
      const deliveredOrder = deliveredOrders.find(
        (order: Order) => order.table === table.table_number
      );

      // Determine table status based on whether it has an order
      const tableStatus = tableOrder || preparedOrder || deliveredOrder ? 'occupied' : 'available';
      
      // For ordered status, payment is always pending
      const paymentStatus: 'pending' | 'paid' | 'partial' = tableOrder ? 'pending' : 'pending';

      const enhancedTable: TableWithOrders = {
        ...table,
        status: tableStatus,
        currentOrder: tableOrder || preparedOrder || deliveredOrder || undefined,
        paymentStatus,
        estimatedDuration: tableOrder ? calculateEstimatedDuration(tableOrder) : undefined,
      };

      setTableWithOrder(enhancedTable);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error al cargar información del pedido de la mesa.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoadingOrders(false);
    }
  };

  const calculateEstimatedDuration = (order: Order): number => {
    // Simple estimation based on order complexity
    const itemCount = order.items?.length || 0;
    const baseTime = 15; // 15 minutes base
    const itemTime = itemCount * 5; // 5 minutes per item
    return baseTime + itemTime;
  };

  const getStatusConfig = (status: string) => {
    return TABLE_STATUS_CONFIG[status as keyof typeof TABLE_STATUS_CONFIG] || TABLE_STATUS_CONFIG.available;
  };

  const getOrderStatusConfig = (status: string) => {
    return ORDER_STATUS_CONFIG[status as keyof typeof ORDER_STATUS_CONFIG] || { label: status.toUpperCase(), color: 'gray' };
  };

  const getItemStatusConfig = (status: string) => {
    const config = ITEM_STATUS_CONFIG[status as keyof typeof ITEM_STATUS_CONFIG] || { label: status, color: 'gray' };
    console.log('Item status:', status, 'Config:', config);
    return config;
  };

  const handleTableAction = async (tableId: string, action: string) => {
    try {
      // TODO: Implement table status update API call
      toaster.create({
        title: 'Acción realizada',
        description: `Acción "${action}" aplicada a la mesa.`,
        type: 'success',
        duration: 3000,
      });
      await fetchTables();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error al realizar la acción en la mesa.',
        type: 'error',
        duration: 5000,
      });
    }
  };

  const handlePaymentInitiation = (table: TableWithOrders) => {
    setShowGooglePayModal(true);
  };

  const initiateGooglePay = async () => {
    // TODO: Implement Google Pay integration
    toaster.create({
      title: 'Google Pay',
      description: 'Integración con Google Pay será implementada próximamente.',
      type: 'info',
      duration: 5000,
    });
    setShowGooglePayModal(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(amount);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'partial':
        return 'yellow';
      default:
        return 'red';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return 'Pagado';
      case 'partial':
        return 'Pago Parcial';
      default:
        return 'Pendiente';
    }
  };

  if (loading) {
    return (
      <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          restaurantId={restaurantId}
        />
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
          <VStack gap={4}>
            <Spinner size="xl" color="blue.500" />
            <Text color="gray.600">Cargando información de mesas...</Text>
          </VStack>
        </Box>
      </Flex>
    );
  }

  if (error) {
    return (
      <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          restaurantId={restaurantId}
        />
        <Box flex={1} p={6}>
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Title>Error al cargar mesas!</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
          </Alert.Root>
        </Box>
      </Flex>
    );
  }

  return (
    <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>

      <Box flex={1} p={{ base: 1, sm: 2, md: 4, lg: 6 }} overflowY="auto" minW={0}>
        <Box w="100%">
          <VStack gap={{ base: 4, md: 6, lg: 8 }} align="stretch">
            {/* Header */}
            <Box textAlign="center" mb={{ base: 4, md: 6, lg: 8 }}>
              <Heading
                fontSize={{ base: 'xl', sm: '2xl', md: '2xl', lg: '3xl', xl: '4xl' }}
                color="gray.800"
                mb={2}
              >
                🍽️ Mesa {tableId}
              </Heading>
              <Text color="gray.600" fontSize={{ base: 'xs', sm: 'sm', md: 'md', lg: 'lg' }}>
                Vista detallada del pedido de la mesa
              </Text>
            </Box>


            {/* Single Table Display */}
            {tableWithOrder ? (
              <Box
                w="100%"
                bg="white"
                borderRadius={{ base: 'lg', md: 'xl' }}
                boxShadow={{ base: 'md', md: 'lg' }}
                border="1px solid"
                borderColor="gray.200"
              >
                <Box pb={2} p={6}>
                  <Flex justify="space-between" align="center">
                    <HStack gap={3}>
                      <Icon as={getStatusConfig(tableWithOrder.status).icon} color={`${getStatusConfig(tableWithOrder.status).color}.500`} boxSize={6} />
                      <Heading size={{ base: 'md', md: 'lg' }} color="gray.800">
                        Mesa {tableWithOrder.table_number}
                      </Heading>
                    </HStack>
                    <Badge colorPalette={getStatusConfig(tableWithOrder.status).color} fontSize="sm">
                      {getStatusConfig(tableWithOrder.status).label}
                    </Badge>
                  </Flex>
                </Box>

                <Box pt={0} px={6} pb={6}>
                  {tableWithOrder.currentOrder ? (
                    <VStack gap={6} align="stretch">
                      {/* Order Header */}
                      <Box>
                        <HStack justify="space-between" mb={3}>
                          <Text fontSize="md" fontWeight="bold" color="gray.700">
                            Pedido #{tableWithOrder.currentOrder.order_id.slice(-6)}
                          </Text>
                          <Badge 
                            colorPalette={getOrderStatusConfig(tableWithOrder.currentOrder.status).color} 
                            fontSize="sm"
                            variant="solid"
                          >
                            {getOrderStatusConfig(tableWithOrder.currentOrder.status).label}
                          </Badge>
                        </HStack>
                        <Text fontSize="sm" color="gray.500">
                          Hora del pedido: {formatTime(tableWithOrder.currentOrder.created_at)}
                        </Text>
                      </Box>

                      {/* Order Items */}
                      <Box>
                        <Text fontSize="md" fontWeight="medium" color="gray.700" mb={4}>
                          Items del Pedido:
                        </Text>
                        <Grid
                          templateColumns={{
                            base: '1fr',
                            sm: 'repeat(auto-fit, minmax(300px, 1fr))',
                            md: 'repeat(auto-fit, minmax(350px, 1fr))',
                            lg: 'repeat(auto-fit, minmax(400px, 1fr))',
                          }}
                          gap={{ base: 3, md: 4 }}
                        >
                          {tableWithOrder.currentOrder.items.map((item, index) => (
                            <Box
                              key={`${item.menu_item_id}-${index}`}
                              p={{ base: 4, md: 5 }}
                              bg="gray.50"
                              borderRadius="lg"
                              border="1px solid"
                              borderColor="gray.200"
                            >
                              <Flex
                                direction={{ base: 'column', sm: 'row' }}
                                gap={3}
                                align={{ base: 'stretch', sm: 'flex-start' }}
                              >
                                {/* Item Image */}
                                {item.image && (
                                  <Box
                                    w={{ base: '100%', sm: '80px' }}
                                    h={{ base: '200px', sm: '80px' }}
                                    bgImage={`url(${item.image})`}
                                    bgSize="cover"
                                    backgroundPosition="center"
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor="gray.300"
                                    flexShrink={0}
                                  />
                                )}

                                {/* Item Details */}
                                <Box flex={1}>
                                  <Flex
                                    direction={{ base: 'column', sm: 'row' }}
                                    justify="space-between"
                                    align={{ base: 'flex-start', sm: 'center' }}
                                    mb={2}
                                  >
                                    <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="medium" color="gray.800">
                                      {item.name}
                                    </Text>
                                    <Badge colorPalette="blue" fontSize="sm" mt={{ base: 1, sm: 0 }}>
                                      x{item.quantity}
                                    </Badge>
                                  </Flex>
                                  
                                  <Flex
                                    direction={{ base: 'column', sm: 'row' }}
                                    justify="space-between"
                                    align={{ base: 'flex-start', sm: 'center' }}
                                    mb={3}
                                    gap={2}
                                  >
                                    <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                                      Precio: {formatCurrency(item.price)}
                                    </Text>
                                    <Text fontSize={{ base: 'sm', md: 'md' }} fontWeight="bold" color="green.600">
                                      Subtotal: {formatCurrency(item.price * item.quantity)}
                                    </Text>
                                  </Flex>

                                  {item.observation && item.observation !== 'Sin observaciones' && (
                                    <Box mb={3}>
                                      <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.500" fontWeight="medium">
                                        Observación:
                                      </Text>
                                      <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600" fontStyle="italic">
                                        "{item.observation}"
                                      </Text>
                                    </Box>
                                  )}

                                  <Flex
                                    justify="space-between"
                                    align="center"
                                    direction={{ base: 'column', sm: 'row' }}
                                    gap={2}
                                  >
                                    <Badge
                                      colorPalette={getItemStatusConfig(item.status).color}
                                      fontSize="sm"
                                     
                                    >
                                      {getItemStatusConfig(item.status).label}
                                    </Badge>
                                  </Flex>
                                </Box>
                              </Flex>
                            </Box>
                          ))}
                        </Grid>
                      </Box>

                      {/* Order Summary */}
                      <Box p={{ base: 4, md: 6 }} bg="blue.50" borderRadius="lg" border="1px solid" borderColor="blue.200">
                        <Flex
                          direction={{ base: 'column', sm: 'row' }}
                          justify="space-between"
                          align={{ base: 'flex-start', sm: 'center' }}
                          mb={3}
                          gap={2}
                        >
                          <Text fontSize={{ base: 'lg', md: 'xl' }} fontWeight="bold" color="gray.700">
                            Total del Pedido:
                          </Text>
                          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="green.600">
                            {formatCurrency(tableWithOrder.currentOrder.total_price)}
                          </Text>
                        </Flex>
                        <Flex
                          direction={{ base: 'column', sm: 'row' }}
                          justify="space-between"
                          align={{ base: 'flex-start', sm: 'center' }}
                          gap={2}
                        >
                          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
                            {tableWithOrder.currentOrder.items.length} items
                          </Text>
                          <Text fontSize={{ base: 'md', md: 'lg' }} color="gray.600">
                            Tiempo estimado: {tableWithOrder.estimatedDuration} min
                          </Text>
                        </Flex>
                      </Box>

                      {/* Action Buttons */}
                      <Button
                        colorPalette="green"
                        size={{ base: 'md', md: 'lg' }}
                        width="100%"
                        height={{ base: '48px', md: '56px' }}
                        fontSize={{ base: 'md', md: 'lg' }}
                        onClick={() => handlePaymentInitiation(tableWithOrder)}
                      >
                        <Icon as={FiCreditCard} mr={2} />
                        Procesar Pago
                      </Button>
                    </VStack>
                  ) : (
                    <Box
                      bg="gray.100"
                      p={8}
                      borderRadius="lg"
                      textAlign="center"
                    >
                      <Text fontSize="lg" color="gray.500" fontWeight="medium">
                        Mesa Vacía
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Box textAlign="center" py={{ base: 8, md: 12 }}>
                <Icon as={FiUsers} boxSize={{ base: 12, md: 16 }} color="gray.400" mb={4} />
                <Heading size={{ base: 'md', md: 'lg' }} color="gray.500" mb={2}>
                  Mesa no encontrada
                </Heading>
                <Text color="gray.400" fontSize={{ base: 'sm', md: 'md' }}>
                  La mesa especificada no existe o no está disponible
                </Text>
              </Box>
            )}

          </VStack>
        </Box>
      </Box>

      {/* Google Pay Modal */}
      <DialogRoot open={showGooglePayModal} onOpenChange={(details) => setShowGooglePayModal(details.open)}>
        <DialogContent>
          <DialogHeader>
            <Heading size="md">💳 Procesar Pago - Mesa {tableWithOrder?.table_number}</Heading>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody pb={6}>
            <VStack gap={4} align="stretch">
              {tableWithOrder?.currentOrder && (
                <>
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                      <Text fontWeight="bold">Total a Pagar:</Text>
                      <Text fontSize="xl" fontWeight="bold" color="green.600">
                        {formatCurrency(tableWithOrder.currentOrder.total_price)}
                      </Text>
                    </HStack>
                    <Text fontSize="sm" color="gray.600">
                      {tableWithOrder.currentOrder.items.length} items en el pedido
                    </Text>
                  </Box>

                  <Alert.Root status="info">
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>Google Pay Integration</Alert.Title>
                      <Alert.Description>
                        La integración con Google Pay estará disponible próximamente.
                        Por ahora, puedes procesar el pago manualmente.
                      </Alert.Description>
                    </Alert.Content>
                  </Alert.Root>

                  <HStack gap={3}>
                    <Button
                      colorPalette="blue"
                      flex={1}
                      onClick={initiateGooglePay}
                    >
                      <Icon as={FiSmartphone} mr={2} />
                      Google Pay (Próximamente)
                    </Button>
                    <Button
                      variant="outline"
                      flex={1}
                      onClick={() => setShowGooglePayModal(false)}
                    >
                      <Icon as={FiCreditCard} mr={2} />
                      Pago Manual
                    </Button>
                  </HStack>
                </>
              )}
            </VStack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </Flex>
  );
};

export default TablePage;
