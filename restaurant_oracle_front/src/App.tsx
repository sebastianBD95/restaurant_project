import React from 'react';
import RestaurantPage from './pages/RestaurantPage';
import MenuPage from './pages/admin/MenuPage';
import LogIn from './pages/LoginPage';
import PaginaRegistro from './pages/RegistryPage';
import Ordenes from './pages/admin/OrdersPage';
import DashboardDO from './components/dashboards/DailyOrders';
import DashboardDR from './components/dashboards/DailyRevenue';
import TrendingMenu from './components/dashboards/TrendingMenu';
import Dashboard from './pages/admin/DashboardPage';
import Inventario from './pages/admin/InventaryPage';
import PaginaReceta from './pages/admin/RecipePage';
import PaginaPagos from './pages/pagos';
import WaiterUserPage from './pages/admin/WaiterUserPage';
import './App.css';

import {
  ChakraProvider,
  defaultSystem,
  Box,
} from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import IngredientPage from './pages/admin/IngredientPage';
import EventsPage from './pages/admin/EventsPage';

function App() {
  return (
    <ChakraProvider value={defaultSystem}>
      <Router>
        <Box>
          <Routes>
            <Route path="/" element={<LogIn />} />
            <Route path="/restaurantes" element={<RestaurantPage />} />
            <Route path="/menu/:restaurantId" element={<MenuPage />} />
            <Route path="/registro" element={<PaginaRegistro />} />
            <Route path="/ordenes" element={<Ordenes />} />
            <Route path="/ordenes/:restaurantId" element={<Ordenes />} />
            <Route path="/daily_orders" element={<DashboardDO />} />
            <Route path="/daily_revenue" element={<DashboardDR />} />
            <Route path="/trending_menu" element={<TrendingMenu />} />
            <Route path="/dashboard/:restaurantId" element={<Dashboard />} />
            <Route path="/inventario" element={<Inventario />} />
            <Route path="/inventario/:restaurantId" element={<Inventario />} />
            <Route path="/recetas" element={<PaginaReceta />} />
            <Route path="/receta/:restaurantId" element={<PaginaReceta />} />
            <Route path="/pagos" element={<PaginaPagos />} />
            <Route path="/pagos/:restaurantId" element={<PaginaPagos />} />
            <Route path="/usuarios/:restaurantId" element={<WaiterUserPage />} />
            <Route path="/ingredientes" element={<IngredientPage />} />
            <Route path="/ingredientes/:restaurantId" element={<IngredientPage />} />
            <Route path="/eventos" element={<EventsPage />} />
            <Route path="/eventos/:restaurantId" element={<EventsPage />} />
          </Routes>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
