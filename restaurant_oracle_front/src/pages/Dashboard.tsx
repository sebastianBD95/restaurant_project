'use client';

import { Button, Box, Heading, VStack, Grid } from '@chakra-ui/react';
import DailyRevenue from './dashboards/DailyRevenue';
import TrendingMenu from './dashboards/TrendingMenu';
import DailyOrders from './dashboards/DailyOrders';
import Historial from './PaginaHistorial';
import PaginaGanancia from './dashboards/Ganancias';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const handleClick = (): void => {
    navigate('/restaurantes');
  };

  return (
    <Box p={6} bg="gray.100" minH="100vh">
      <Heading textAlign="center" mb={6}>
        📊 Dashboard del Restaurante
      </Heading>

      <Button
        color="orange"
        variant="subtle"
        size="md"
        flex={1}
        h="45px"
        mb={6}
        onClick={handleClick}
      >
        Inicio
      </Button>

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
      <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap={6}>
        <Box bg="white" p={4} borderRadius="md" boxShadow="md" h="600px" overflowY="auto">
          <Heading size="md" mb={4}>
            📜 Historial de Pedidos
          </Heading>
          <Historial />
        </Box>

        <Box bg="white" p={4} borderRadius="md" boxShadow="md" h="600px">
          <Heading size="md" mb={4}>
            🔥 Platos Más Populares
          </Heading>
          <TrendingMenu />
        </Box>
      </Grid>
    </Box>
  );
};

export default Dashboard;
