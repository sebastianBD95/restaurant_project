import React, { useState } from 'react';
import RestaurantPage from './pages/RestaurantPage';
import MenuPage from './pages/MenuPage';
import LogIn from './pages/PaginaLogIn';
import PaginaRegistro from './pages/PaginaRegistro';
import Ordenes from './pages/PaginaOrdenes';
import Historial from './pages/PaginaHistorial';
import DashboardDO from './pages/dashboards/DailyOrders';
import DashboardDR from './pages/dashboards/DailyRevenue';
import TrendingMenu from './pages/dashboards/TrendingMenu';
import Dashboard from './pages/Dashboard';
import RestaurantLayout from './RestaurantLayout';
import Inventario from './Inventario';
import PaginaReceta from './Receta';
import PaginaPagos from './pages/pagos';
import './App.css';

import {
  ChakraProvider,
  defaultSystem,
  Box,
  Flex,
  Text,
  Link,
  VStack,
  Icon,
  Button,
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from 'react-router-dom';
import {
  FiHome,
  FiMenu,
  FiShoppingCart,
  FiBarChart2,
  FiList,
  FiChevronLeft,
  FiChevronRight,
  FiToggleLeft,
} from 'react-icons/fi';
import { MdOutlineInventory2 } from 'react-icons/md';
import { MdRestaurantMenu } from 'react-icons/md';
import { MdPayment } from 'react-icons/md';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <ChakraProvider value={defaultSystem}>
      <Router>
        <Flex height="100vh" direction="row">
          {/* Barra lateral de navegación plegable */}
          <Box
            bg="white"
            color="white"
            p={4}
            width={isSidebarOpen ? '250px' : '60px'}
            transition="width 0.3s"
          >
            <Button onClick={toggleSidebar} mb={4} colorScheme="teal">
              {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
            </Button>
            {isSidebarOpen && (
              <>
                <Text fontSize="2xl" fontWeight="bold" mb={6} color="black" textAlign="center">
                  Restaurante
                </Text>
                <VStack align="stretch">
                  <Link
                    as={RouterLink}
                    to="/restaurantes"
                    display="flex"
                    alignItems="center"
                    gap={2}
                  >
                    <Icon as={FiHome} />
                    Inicio
                  </Link>
                  <Link as={RouterLink} to="/menu" display="flex" alignItems="center" gap={2}>
                    <Icon as={FiMenu} />
                    Menú
                  </Link>
                  <Link as={RouterLink} to="/ordenes" display="flex" alignItems="center" gap={2}>
                    <Icon as={FiShoppingCart} />
                    Pedidos
                  </Link>
                  <Link as={RouterLink} to="/dashboard" display="flex" alignItems="center" gap={2}>
                    <Icon as={FiBarChart2} />
                    Gráficas
                  </Link>
                  <Link as={RouterLink} to="/inventario" display="flex" alignItems="center" gap={2}>
                    <Icon as={MdOutlineInventory2} />
                    Inventario
                  </Link>
                  <Link as={RouterLink} to="/receta" display="flex" alignItems="center" gap={2}>
                    <Icon as={MdRestaurantMenu} />
                    Recetas
                  </Link>
                  <Link as={RouterLink} to="/pagos" display="flex" alignItems="center" gap={2}>
                    <Icon as={MdPayment} />
                    Pagos
                  </Link>

                  <Link as={RouterLink} to="/" display="flex" alignItems="center" gap={2}>
                    <Icon as={FiToggleLeft} />
                    Cerrar sesión
                  </Link>
                </VStack>
              </>
            )}
          </Box>

          {/* Contenido Principal */}
          <Box flex={1} p={6} overflowY="auto">
            <Routes>
              <Route path="/" element={<LogIn />} />
              <Route path="/restaurantes" element={<RestaurantPage />} />
              <Route path="/menu" element={<MenuPage />} />
              <Route path="/registro" element={<PaginaRegistro />} />
              <Route path="/ordenes" element={<Ordenes />} />
              <Route path="/historial" element={<Historial />} />
              <Route path="/daily_orders" element={<DashboardDO />} />
              <Route path="/daily_revenue" element={<DashboardDR />} />
              <Route path="/trending_menu" element={<TrendingMenu />} />
              <Route path="/dashboard/:restaurantId" element={<Dashboard />} />
              <Route path="/restaurante_layaout" element={<RestaurantLayout />} />
              <Route path="/inventario" element={<Inventario />} />
              <Route path="/recetas" element={<PaginaReceta />} />
              <Route path="/pagos" element={<PaginaPagos />} />
            </Routes>
          </Box>
        </Flex>
      </Router>
    </ChakraProvider>
  );
}
export default App;
