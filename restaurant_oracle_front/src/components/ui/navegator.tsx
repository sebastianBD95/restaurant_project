import React from 'react';
import { Box, Button, Text, VStack, Icon } from '@chakra-ui/react';
import { Link, useParams } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiHome, FiMenu, FiShoppingCart, FiBarChart2, FiToggleLeft } from 'react-icons/fi';
import { MdOutlineInventory2, MdRestaurantMenu, MdPayment ,MdAccountCircle } from 'react-icons/md';
import { isWaiter } from '../../pages/utils/roleUtils';

interface SidebarProps {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  restaurantId?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, toggleSidebar, restaurantId }) => {
  // If restaurantId is not provided as a prop, try to get it from URL params
 
  const params = useParams();
  const currentRestaurantId = restaurantId || params.restaurantId;
  if (isWaiter()) {
    return null;
  } 

  return (
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
            <Link to="/restaurantes" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray' }}>
              <Icon as={FiHome} />
              Inicio
            </Link>
            <Link to={currentRestaurantId ? `/menu/${currentRestaurantId}` : "/menu"} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray' }}>
              <Icon as={FiMenu} />
              Menú
            </Link>
            <Link to={currentRestaurantId ? `/ordenes/${currentRestaurantId}` : "/ordenes"} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray' }}>
              <Icon as={FiShoppingCart} />
              Pedidos
            </Link>
            <Link to={currentRestaurantId ? `/dashboard/${currentRestaurantId}` : "/dashboard"} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray' }}>
              <Icon as={FiBarChart2} />
              Gráficas
            </Link>
            <Link to={currentRestaurantId ? `/inventario/${currentRestaurantId}` : "/inventario"} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray' }}>
              <Icon as={MdOutlineInventory2} />
              Inventario
            </Link>
            <Link to={currentRestaurantId ? `/receta/${currentRestaurantId}` : "/receta"} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray' }}>
              <Icon as={MdRestaurantMenu} />
              Recetas
            </Link>
            <Link to={currentRestaurantId ? `/pagos/${currentRestaurantId}` : "/pagos"} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray' }}>
              <Icon as={MdPayment} />
              Pagos
            </Link>
            <Link to={currentRestaurantId ? `/usuarios/${currentRestaurantId}` : "/usuarios"} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray' }}>
              <Icon as={MdAccountCircle} />
              Meseros
            </Link>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'gray' }}>
              <Icon as={FiToggleLeft} />
              Cerrar sesión
            </Link>
          </VStack>
        </>
      )}
    </Box>
  );
};