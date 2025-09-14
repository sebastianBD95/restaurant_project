'use client';

import { Box, Heading, Grid, Flex, Text, Icon, Spinner, VStack } from '@chakra-ui/react';
import DailyRevenue from '../../components/dashboards/DailyRevenue';
import TrendingMenu from '../../components/dashboards/TrendingMenu';
import DailyOrders from '../../components/dashboards/DailyOrders';
import Historial from '../../components/dashboards/Historial';
import PaginaGanancia from '../../components/dashboards/Reveneu';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { FiTrendingUp, FiDollarSign, FiShoppingCart, FiBarChart2, FiUser } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { getOrdersByRestaurant } from '../../services/orderService';

interface DashboardMetrics {
  todayOrders: number;
  todayRevenue: number;
  todayProfit: number;
  todayItemsSold: number;
}

interface WeeklyData {
  date: string;
  orders: number;
  revenue: number;
  profit: number;
  itemsSold: number;
}

const Dashboard: React.FC = () => {
  const { restaurantId } = useParams();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    todayOrders: 0,
    todayRevenue: 0,
    todayProfit: 0,
    todayItemsSold: 0,
  });
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      // Get today's date range for today's metrics
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
      
      const todayStartDate = startOfDay.toISOString().split('T')[0];
      const todayEndDate = endOfDay.toISOString().split('T')[0];

      // Get weekly date range (past 7 days)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekStartDate = weekAgo.toISOString().split('T')[0];
      const weekEndDate = todayEndDate;

      // Fetch all orders for today (for summary metrics)
      const [todayPaidOrders, todayDeliveredOrders] = await Promise.all([
        getOrdersByRestaurant(restaurantId, 'paid', '', todayStartDate, todayEndDate),
        getOrdersByRestaurant(restaurantId, 'delivered', '', todayStartDate, todayEndDate)
      ]);

      // Fetch all orders for the week (for charts)
      const [weekPaidOrders, weekDeliveredOrders] = await Promise.all([
        getOrdersByRestaurant(restaurantId, 'paid', '', weekStartDate, weekEndDate),
        getOrdersByRestaurant(restaurantId, 'delivered', '', weekStartDate, weekEndDate)
      ]);

      // Combine today's orders for metrics
      const todayAllOrders = [...todayPaidOrders, ...todayDeliveredOrders];
      
      // Calculate today's metrics
      const todayOrders = todayAllOrders.length;
      console.log('Today orders', todayOrders);
      const todayRevenue = todayAllOrders.reduce((sum, order) => sum + order.total_price, 0);
      const todayProfit = todayRevenue * 0.3; // Assuming 30% profit margin
      const todayItemsSold = todayAllOrders.reduce((sum, order) => 
        sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
      );

      // Combine week's orders for charts
      const weekAllOrders = [...weekPaidOrders, ...weekDeliveredOrders];

      // Group orders by date for weekly data
      const ordersByDate: { [key: string]: any[] } = {};
      weekAllOrders.forEach(order => {
        const orderDate = new Date(order.created_at).toISOString().split('T')[0];
        if (!ordersByDate[orderDate]) {
          ordersByDate[orderDate] = [];
        }
        ordersByDate[orderDate].push(order);
      });

      // Generate weekly data array
      const weeklyDataArray: WeeklyData[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateString = date.toISOString().split('T')[0];
        const dayOrders = ordersByDate[dateString] || [];
        
        const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total_price, 0);
        const dayProfit = dayRevenue * 0.3;
        const dayItemsSold = dayOrders.reduce((sum, order) => 
          sum + order.items.reduce((itemSum: number, item: any) => itemSum + item.quantity, 0), 0
        );

        weeklyDataArray.push({
          date: dateString,
          orders: dayOrders.length,
          revenue: dayRevenue,
          profit: dayProfit,
          itemsSold: dayItemsSold,
        });
      }

      setMetrics({
        todayOrders,
        todayRevenue,
        todayProfit,
        todayItemsSold,
      });

      setWeeklyData(weeklyDataArray);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [restaurantId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Flex height="100vh" width="100vw" direction="row">
      {/* Barra lateral de navegación plegable */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        restaurantId={restaurantId}
      />

      {/* Contenido Principal */}
      <Box flex={1} overflowY="auto" bg="gray.50">
        {/* Header Section */}
        <Box 
          bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          color="white"
          p={8}
          position="relative"
          overflow="hidden"
        >
          <Box position="absolute" top={0} right={0} opacity={0.1}>
            <Icon as={FiTrendingUp} boxSize={200} />
          </Box>
          <Heading 
            size="2xl" 
            textAlign="center" 
            mb={2}
            fontWeight="bold"
            textShadow="0 2px 4px rgba(0,0,0,0.3)"
          >
            Dashboard del Restaurante
          </Heading>
          <Text 
            textAlign="center" 
            fontSize="lg" 
            opacity={0.9}
            fontWeight="medium"
          >
            Monitoreo en tiempo real de tu negocio
          </Text>
        </Box>

        {/* Main Content */}
        <Box p={8} maxW="1400px" mx="auto">
          {/* Stats Overview Row */}
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={6} mb={8}>
            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
              position="relative"
              overflow="hidden"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s ease"
            >
              <Box position="absolute" top={0} right={0} bg="blue.500" p={2} borderRadius="0 0 0 12px">
                <Icon as={FiShoppingCart} color="white" boxSize={5} />
              </Box>
              <Box>
                <Text color="gray.600" fontSize="sm" fontWeight="medium">Órdenes Hoy</Text>
                {loading ? (
                  <Spinner size="lg" color="blue.500" />
                ) : (
                  <Text color="gray.800" fontSize="3xl" fontWeight="bold">{metrics.todayOrders}</Text>
                )}
                <Flex align="center" color="green.500" fontSize="sm">
                  <Icon as={FiTrendingUp} mr={1} />
                  Hoy
                </Flex>
              </Box>
            </Box>

            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
              position="relative"
              overflow="hidden"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s ease"
            >
              <Box position="absolute" top={0} right={0} bg="green.500" p={2} borderRadius="0 0 0 12px">
                <Icon as={FiDollarSign} color="white" boxSize={5} />
              </Box>
              <Box>
                <Text color="gray.600" fontSize="sm" fontWeight="medium">Ingresos Hoy</Text>
                {loading ? (
                  <Spinner size="lg" color="green.500" />
                ) : (
                  <Text color="gray.800" fontSize="3xl" fontWeight="bold">{formatCurrency(metrics.todayRevenue)}</Text>
                )}
                <Flex align="center" color="green.500" fontSize="sm">
                  <Icon as={FiTrendingUp} mr={1} />
                  Hoy
                </Flex>
              </Box>
            </Box>

            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
              position="relative"
              overflow="hidden"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s ease"
            >
              <Box position="absolute" top={0} right={0} bg="purple.500" p={2} borderRadius="0 0 0 12px">
                <Icon as={FiTrendingUp} color="white" boxSize={5} />
              </Box>
              <Box>
                <Text color="gray.600" fontSize="sm" fontWeight="medium">Ganancia Hoy</Text>
                {loading ? (
                  <Spinner size="lg" color="purple.500" />
                ) : (
                  <Text color="gray.800" fontSize="3xl" fontWeight="bold">{formatCurrency(metrics.todayProfit)}</Text>
                )}
                <Flex align="center" color="green.500" fontSize="sm">
                  <Icon as={FiTrendingUp} mr={1} />
                  Hoy
                </Flex>
              </Box>
            </Box>

            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
              position="relative"
              overflow="hidden"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s ease"
            >
              <Box position="absolute" top={0} right={0} bg="orange.500" p={2} borderRadius="0 0 0 12px">
                <Icon as={FiUser} color="white" boxSize={5} />
              </Box>
              <Box>
                <Text color="gray.600" fontSize="sm" fontWeight="medium">Platos Vendidos</Text>
                {loading ? (
                  <Spinner size="lg" color="orange.500" />
                ) : (
                  <Text color="gray.800" fontSize="3xl" fontWeight="bold">{metrics.todayItemsSold}</Text>
                )}
                <Flex align="center" color="green.500" fontSize="sm">
                  <Icon as={FiTrendingUp} mr={1} />
                  Hoy
                </Flex>
              </Box>
            </Box>
          </Grid>

          {/* Charts Row */}
          <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr 1fr' }} gap={6} mb={8}>
            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s ease"
            >
              <Flex align="center" mb={4}>
                <Box 
                  bg="blue.100" 
                  p={2} 
                  borderRadius="lg" 
                  mr={3}
                >
                  <Icon as={FiBarChart2} color="blue.600" boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    Órdenes por Día
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Tendencias de pedidos diarios
                  </Text>
                </Box>
              </Flex>
              <Box h="400px">
                <DailyOrders weeklyData={weeklyData} />
              </Box>
            </Box>

            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s ease"
            >
              <Flex align="center" mb={4}>
                <Box 
                  bg="green.100" 
                  p={2} 
                  borderRadius="lg" 
                  mr={3}
                >
                  <Icon as={FiDollarSign} color="green.600" boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    Ingresos vs Costos
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Análisis financiero diario
                  </Text>
                </Box>
              </Flex>
              <Box h="400px">
                <DailyRevenue weeklyData={weeklyData} />
              </Box>
            </Box>

            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s ease"
            >
              <Flex align="center" mb={4}>
                <Box 
                  bg="purple.100" 
                  p={2} 
                  borderRadius="lg" 
                  mr={3}
                >
                  <Icon as={FiTrendingUp} color="purple.600" boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    Ganancias
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Margen de utilidad diario
                  </Text>
                </Box>
              </Flex>
              <Box h="400px">
                <PaginaGanancia weeklyData={weeklyData} />
              </Box>
            </Box>
          </Grid>

          {/* Bottom Row */}
          <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s ease"
            >
              <Flex align="center" mb={4}>
                <Box 
                  bg="orange.100" 
                  p={2} 
                  borderRadius="lg" 
                  mr={3}
                >
                  <Icon as={FiBarChart2} color="orange.600" boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    Historial de Ventas
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Registro de pedidos pagados
                  </Text>
                </Box>
              </Flex>
              <Box>
                <Historial />
              </Box>
            </Box>

            <Box 
              bg="white" 
              p={6} 
              borderRadius="xl" 
              boxShadow="lg"
              border="1px solid"
              borderColor="gray.200"
              _hover={{ transform: 'translateY(-2px)', boxShadow: 'xl' }}
              transition="all 0.3s ease"
            >
              <Flex align="center" mb={4}>
                <Box 
                  bg="red.100" 
                  p={2} 
                  borderRadius="lg" 
                  mr={3}
                >
                  <Icon as={FiUser} color="red.600" boxSize={5} />
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color="gray.800">
                    Platos Populares
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Los favoritos de tus clientes
                  </Text>
                </Box>
              </Flex>
              <Box>
                <TrendingMenu />
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>
    </Flex>
  );
};

export default Dashboard;
