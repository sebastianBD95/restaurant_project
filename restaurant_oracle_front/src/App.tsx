import React,  { useState }  from 'react';
import MiComponente from './PaginaInicio';
import PaginaMenu from './paginaMenu';
import LogIn from './PaginaLogIn';
import PaginaRegistro from './PaginaRegistro';
import Ordenes from './PaginaOrdenes';
import Historial from './PaginaHistorial';
import DashboardDO from './Dashboards/DailyOrders';
import DashboardDR from './Dashboards/DailyRevenue';
import TrendingMenu from './Dashboards/TrendingMenu';
import Dashboard from './Dashboard';
import RestaurantLayout from './RestaurantLayout';
import Inventario from './Inventario';
import PaginaReceta from './Receta';
import PaginaPagos from './pagos';
import './App.css';

import { ChakraProvider,defaultSystem, Box, Flex, Text, Link, VStack, Icon, Button } from "@chakra-ui/react";
import { BrowserRouter as Router, Routes, Route, Link as RouterLink } from "react-router-dom";
import { FiHome, FiMenu, FiShoppingCart, FiBarChart2, FiList, FiChevronLeft, FiChevronRight, FiToggleLeft } from "react-icons/fi";
import { MdOutlineInventory2 } from "react-icons/md";
import { MdRestaurantMenu } from "react-icons/md";
import { MdPayment } from "react-icons/md";


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
          <Box bg="white" color="white" p={4} width={isSidebarOpen ? "250px" : "60px"} transition="width 0.3s">
            <Button onClick={toggleSidebar} mb={4} colorScheme="teal">
              {isSidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
            </Button>
            {isSidebarOpen && (
              <>
                <Text fontSize="2xl" fontWeight="bold" mb={6} color="black" textAlign="center">Restaurante</Text>
                <VStack align="stretch" >
                  <Link as={RouterLink} to="/pagina1" display="flex" alignItems="center" gap={2}>
                    <Icon as={FiHome} />
                    Inicio
                  </Link>
                  <Link as={RouterLink} to="/nueva-pagina" display="flex" alignItems="center" gap={2}>
                    <Icon as={FiMenu} />
                    Menú
                  </Link>
                  <Link as={RouterLink} to="/Ordenes" display="flex" alignItems="center" gap={2}>
                    <Icon as={FiShoppingCart} />
                    Pedidos
                  </Link>
                  <Link as={RouterLink} to="/Dashboard" display="flex" alignItems="center" gap={2}>
                    <Icon as={FiBarChart2} />
                    Gráficas
                  </Link>
                  <Link as={RouterLink} to="/Inventario" display="flex" alignItems="center" gap={2}>
                    <Icon as={MdOutlineInventory2} />
                    Inventario
                  </Link>
                  <Link as={RouterLink} to="/Receta" display="flex" alignItems="center" gap={2}>
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
              <Route path="/pagina1" element={<MiComponente />} />
              <Route path="/nueva-pagina" element={<PaginaMenu />} />
              <Route path="/Registro" element={<PaginaRegistro />} />
              <Route path="/Ordenes" element={<Ordenes />} />
              <Route path="/Historial" element={<Historial />} />
              <Route path="/DailyOrders" element={<DashboardDO />} />
              <Route path="/DailyRevenue" element={<DashboardDR />} />
              <Route path="/TrendingMenu" element={<TrendingMenu />} />
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="/RestaurantLayout" element={<RestaurantLayout />} />
              <Route path="/Inventario" element={<Inventario />} />
              <Route path="/Receta" element={<PaginaReceta />} />
              <Route path="/pagos" element={<PaginaPagos />} />

            </Routes>
          </Box>
        </Flex>
      </Router>
    </ChakraProvider>
  );
}
export default App;
