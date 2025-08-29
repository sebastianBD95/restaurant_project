'use client';

import { Button, Box, Heading, VStack, Grid, Flex } from '@chakra-ui/react';
import DailyRevenue from '../../components/dashboards/DailyRevenue';
import TrendingMenu from '../../components/dashboards/TrendingMenu';
import DailyOrders from '../../components/dashboards/DailyOrders';
import Historial from '../../components/dashboards/PaginaHistorial';
import PaginaGanancia from '../../components/dashboards/Reveneu';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';

const Dashboard: React.FC = () => {
  const { restaurantId } = useParams();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  return (
    <Flex height="100vh" width="100vw" direction="row">
      {/* Barra lateral de navegación plegable */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        restaurantId={restaurantId}
      />

      {/* Contenido Principal */}
      <Box flex={1} p={6} overflowY="auto">
        <Box p={6} bg="gray.100" minH="100vh">
          <Heading textAlign="center" mb={6}>
            📊 Dashboard del Restaurante
          </Heading>

          {/* Primera fila con DailyOrders y DailyRevenue */}
          <Grid templateColumns={{ base: '2fr', md: '1fr 1fr 1fr' }} gap={6} mb={6}>
            <Box bg="white" p={4} borderRadius="sm" boxShadow="xs" h="550px">
              <Heading size="xs" mb={4}>
                📅 Órdenes por Día
              </Heading>
              <DailyOrders />
            </Box>

            <Box bg="white" p={4} borderRadius="sm" boxShadow="xs" h="550px">
              <Heading size="xs" mb={4}>
                💰 Ingresos, Costos{' '}
              </Heading>
              <DailyRevenue />
            </Box>
            <Box bg="white" p={4} borderRadius="sm" boxShadow="xs" h="550px">
              <Heading size="xs" mb={4}>
                💰 Ganancias
              </Heading>
              <PaginaGanancia />
            </Box>
          </Grid>

          {/* Segunda fila con Historial y Platos Populares */}
          <Grid templateColumns={{ base: '1fr', md: '1fr 1fr' }} gap={6}>
            <Box bg="white" p={4} borderRadius="sm" boxShadow="xs" h="550px">
              <Heading size="xs" mb={4}>
                📊 Historial de Ventas
              </Heading>
              <Historial />
            </Box>

            <Box bg="white" p={4} borderRadius="sm" boxShadow="xs" h="550px">
              <Heading size="xs" mb={4}>
                🍽️ Platos Populares
              </Heading>
              <TrendingMenu />
            </Box>
          </Grid>
        </Box>
      </Box>
    </Flex>
  );
};

export default Dashboard;
