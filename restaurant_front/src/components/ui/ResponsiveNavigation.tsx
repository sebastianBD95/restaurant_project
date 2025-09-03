import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  Flex,
  Button,
  Text,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  useDisclosure,
  useColorModeValue,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import {
  FiMenu,
  FiSearch,
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiHome,
  FiBarChart2,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiCalendar,
  FiDollarSign,
} from 'react-icons/fi';
import { MdOutlineInventory2, MdRestaurantMenu } from 'react-icons/md';
import { useResponsive, useResponsiveNavigation } from '../../hooks/useResponsive';
import { isWaiter } from '../../pages/utils/roleUtils';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  badge?: number;
  isAdmin?: boolean;
}

interface ResponsiveNavigationProps {
  restaurantId?: string;
  onLogout?: () => void;
  userRole?: string;
  userName?: string;
}

export const ResponsiveNavigation: React.FC<ResponsiveNavigationProps> = ({
  restaurantId,
  onLogout,
  userRole = 'admin',
  userName = 'Usuario',
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const location = useLocation();
  const { isMobile, isTablet } = useResponsive();
  const navConfig = useResponsiveNavigation();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const navigationItems: NavigationItem[] = [
    {
      label: 'Inicio',
      path: '/restaurantes',
      icon: <FiHome />,
      isAdmin: true,
    },
    {
      label: 'Dashboard',
      path: restaurantId ? `/dashboard/${restaurantId}` : '/dashboard',
      icon: <FiBarChart2 />,
      isAdmin: true,
    },
    {
      label: 'Inventario',
      path: restaurantId ? `/inventario/${restaurantId}` : '/inventario',
      icon: <MdOutlineInventory2 />,
      isAdmin: true,
    },
    {
      label: 'Ingredientes',
      path: restaurantId ? `/ingredientes/${restaurantId}` : '/ingredientes',
      icon: <FiPackage />,
      isAdmin: true,
    },
    {
      label: 'Recetas',
      path: restaurantId ? `/receta/${restaurantId}` : '/receta',
      icon: <MdRestaurantMenu />,
      isAdmin: true,
    },
    {
      label: 'Menú',
      path: restaurantId ? `/menu/${restaurantId}` : '/menu',
      icon: <FiMenu />,
      isAdmin: true,
    },
    {
      label: 'Usuarios',
      path: restaurantId ? `/usuarios/${restaurantId}` : '/usuarios',
      icon: <FiUsers />,
      isAdmin: true,
    },
    {
      label: 'Eventos',
      path: restaurantId ? `/eventos/${restaurantId}` : '/eventos',
      icon: <FiCalendar />,
      isAdmin: true,
    },
    {
      label: 'Pagos',
      path: restaurantId ? `/pagos/${restaurantId}` : '/pagos',
      icon: <FiDollarSign />,
      isAdmin: true,
    },
    {
      label: 'Órdenes',
      path: restaurantId ? `/ordenes/${restaurantId}` : '/ordenes',
      icon: <FiShoppingCart />,
      badge: 5,
      isAdmin: true,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/restaurantes') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    onLogout?.();
    onClose();
  };

  const renderNavigationItem = (item: NavigationItem) => {
    if (item.isAdmin && userRole !== 'admin') return null;
    
    return (
      <Link key={item.path} to={item.path} onClick={onClose}>
        <Flex
          align="center"
          px={4}
          py={3}
          borderRadius="md"
          _hover={{
            bg: useColorModeValue('gray.100', 'gray.700'),
          }}
          bg={isActive(item.path) ? useColorModeValue('blue.50', 'blue.900') : 'transparent'}
          color={isActive(item.path) ? 'blue.600' : textColor}
          fontWeight={isActive(item.path) ? 'semibold' : 'normal'}
        >
          <Box mr={3} fontSize="lg">
            {item.icon}
          </Box>
          <Text flex={1}>{item.label}</Text>
          {item.badge && (
            <Badge colorScheme="red" variant="solid" borderRadius="full">
              {item.badge}
            </Badge>
          )}
        </Flex>
      </Link>
    );
  };

  const renderMobileNavigation = () => (
    <>
      <IconButton
        aria-label="Open navigation menu"
        icon={<FiMenu />}
        onClick={onOpen}
        variant="ghost"
        size="lg"
        display={{ base: 'flex', md: 'none' }}
      />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            <Flex align="center">
              <Box
                w={8}
                h={8}
                bg="blue.500"
                borderRadius="md"
                display="flex"
                align="center"
                justify="center"
                color="white"
                fontWeight="bold"
                mr={3}
              >
                R
              </Box>
              <Text fontSize="lg" fontWeight="bold">
                Restaurante
              </Text>
            </Flex>
          </DrawerHeader>

          <DrawerBody p={0}>
            <VStack spacing={0} align="stretch">
              {navigationItems.map(renderNavigationItem)}
              
              <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
                <Flex align="center" mb={3}>
                  <Avatar size="sm" name={userName} mr={3} />
                  <Box>
                    <Text fontWeight="semibold" fontSize="sm">
                      {userName}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {userRole === 'admin' ? 'Administrador' : 'Mesero'}
                    </Text>
                  </Box>
                </Flex>
                
                <VStack spacing={2} align="stretch">
                  <Button
                    leftIcon={<FiSettings />}
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    onClick={onClose}
                  >
                    Configuración
                  </Button>
                  <Button
                    leftIcon={<FiLogOut />}
                    variant="ghost"
                    size="sm"
                    justifyContent="flex-start"
                    colorScheme="red"
                    onClick={handleLogout}
                  >
                    Cerrar Sesión
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );

  const renderDesktopNavigation = () => (
    <Flex
      display={{ base: 'none', md: 'flex' }}
      align="center"
      justify="space-between"
      w="full"
      px={6}
      py={4}
      borderBottomWidth="1px"
      borderColor={borderColor}
      bg={bgColor}
    >
      {/* Logo and Brand */}
      <Flex align="center">
        <Link to="/restaurantes">
          <Flex align="center">
            <Box
              w={8}
              h={8}
              bg="blue.500"
              borderRadius="md"
              display="flex"
              align="center"
              justify="center"
              color="white"
              fontWeight="bold"
              mr={3}
            >
              R
            </Box>
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Restaurante
            </Text>
          </Flex>
        </Link>
      </Flex>

      {/* Search Bar */}
      {navConfig.showSearch && (
        <Flex flex={1} maxW="400px" mx={8}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Buscar..."
              variant="filled"
              bg={useColorModeValue('gray.100', 'gray.700')}
              _hover={{
                bg: useColorModeValue('gray.200', 'gray.600'),
              }}
              _focus={{
                bg: useColorModeValue('white', 'gray.600'),
                borderColor: 'blue.500',
              }}
            />
          </InputGroup>
        </Flex>
      )}

      {/* Right Side Actions */}
      <Flex align="center" gap={4}>
        {/* Notifications */}
        <IconButton
          aria-label="Notifications"
          icon={<FiBell />}
          variant="ghost"
          size="md"
          position="relative"
        >
          <Badge
            colorScheme="red"
            variant="solid"
            position="absolute"
            top={1}
            right={1}
            borderRadius="full"
            fontSize="xs"
          >
            3
          </Badge>
        </IconButton>

        {/* User Menu */}
        {navConfig.showUserMenu && (
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<FiUser />}
              leftIcon={<Avatar size="sm" name={userName} />}
            >
              <Text display={{ base: 'none', lg: 'block' }}>{userName}</Text>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />}>Perfil</MenuItem>
              <MenuItem icon={<FiSettings />}>Configuración</MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={onLogout} color="red.500">
                Cerrar Sesión
              </MenuItem>
            </MenuList>
          </Menu>
        )}
      </Flex>
    </Flex>
  );

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={1000}
      bg={bgColor}
      borderBottomWidth="1px"
      borderColor={borderColor}
    >
      {renderMobileNavigation()}
      {renderDesktopNavigation()}
    </Box>
  );
};

export default ResponsiveNavigation;