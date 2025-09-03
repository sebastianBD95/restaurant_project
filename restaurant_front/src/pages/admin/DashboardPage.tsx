'use client';

import { Box, Heading, Grid, Flex, useColorModeValue } from '@chakra-ui/react';
import DailyRevenue from '../../components/dashboards/DailyRevenue';
import TrendingMenu from '../../components/dashboards/TrendingMenu';
import DailyOrders from '../../components/dashboards/DailyOrders';
import Historial from '../../components/dashboards/Historial';
import PaginaGanancia from '../../components/dashboards/Reveneu';
import { useParams } from 'react-router-dom';
import ResponsiveSidebar from '../../components/ui/ResponsiveSidebar';
import { useSidebar } from '../../hooks/useSidebar';
import { useResponsive, useResponsiveGrid } from '../../hooks/useResponsive';

const Dashboard: React.FC = () => {
  const { restaurantId } = useParams();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const { isMobile, isTablet } = useResponsive();
  const gridConfig = useResponsiveGrid();
  
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');

  return (
    <Flex height="100vh" width="100vw" direction="row">
      {/* Responsive Sidebar */}
      <ResponsiveSidebar
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        restaurantId={restaurantId}
      />

      {/* Main Content */}
      <Box 
        flex={1} 
        p={{ base: 2, md: 4, lg: 6 }} 
        overflowY="auto"
        ml={{ base: 0, md: isSidebarOpen ? '250px' : '60px' }}
        transition="margin-left 0.3s"
      >
        <Box 
          p={{ base: 3, md: 4, lg: 6 }} 
          bg={bgColor} 
          minH="100vh"
          borderRadius={{ base: 'none', md: 'lg' }}
        >
          <Heading 
            textAlign="center" 
            mb={{ base: 4, md: 6 }}
            fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
            color={textColor}
          >
            📊 Dashboard del Restaurante
          </Heading>

          {/* First Row - Daily Orders, Revenue, and Profits */}
          <Grid 
            templateColumns={{ 
              base: '1fr', 
              md: '1fr 1fr', 
              lg: '1fr 1fr 1fr' 
            }} 
            gap={{ base: 3, md: 4, lg: 6 }} 
            mb={{ base: 4, md: 6 }}
          >
            <Box 
              bg={cardBgColor} 
              p={{ base: 3, md: 4 }} 
              borderRadius="lg" 
              boxShadow="sm" 
              h={{ base: '400px', md: '500px', lg: '550px' }}
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <Heading size={{ base: 'sm', md: 'md' }} mb={4} color={textColor}>
                📅 Órdenes por Día
              </Heading>
              <DailyOrders />
            </Box>

            <Box 
              bg={cardBgColor} 
              p={{ base: 3, md: 4 }} 
              borderRadius="lg" 
              boxShadow="sm" 
              h={{ base: '400px', md: '500px', lg: '550px' }}
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              display={{ base: 'none', md: 'block' }}
            >
              <Heading size={{ base: 'sm', md: 'md' }} mb={4} color={textColor}>
                💰 Ingresos y Costos
              </Heading>
              <DailyRevenue />
            </Box>
            
            <Box 
              bg={cardBgColor} 
              p={{ base: 3, md: 4 }} 
              borderRadius="lg" 
              boxShadow="sm" 
              h={{ base: '400px', md: '500px', lg: '550px' }}
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              display={{ base: 'none', lg: 'block' }}
            >
              <Heading size={{ base: 'sm', md: 'md' }} mb={4} color={textColor}>
                💰 Ganancias
              </Heading>
              <PaginaGanancia />
            </Box>
          </Grid>

          {/* Second Row - Sales History and Popular Dishes */}
          <Grid 
            templateColumns={{ 
              base: '1fr', 
              md: '1fr 1fr' 
            }} 
            gap={{ base: 3, md: 4, lg: 6 }}
          >
            <Box 
              bg={cardBgColor} 
              p={{ base: 3, md: 4 }} 
              borderRadius="lg" 
              boxShadow="sm" 
              h={{ base: '400px', md: '500px', lg: '550px' }}
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <Heading size={{ base: 'sm', md: 'md' }} mb={4} color={textColor}>
                📊 Historial de Ventas
              </Heading>
              <Historial />
            </Box>

            <Box 
              bg={cardBgColor} 
              p={{ base: 3, md: 4 }} 
              borderRadius="lg" 
              boxShadow="sm" 
              h={{ base: '400px', md: '500px', lg: '550px' }}
              border="1px solid"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
            >
              <Heading size={{ base: 'sm', md: 'md' }} mb={4} color={textColor}>
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
