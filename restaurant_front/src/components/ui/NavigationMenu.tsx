import React from 'react';
import {
  Box,
  HStack,
  Button,
  Text,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  HomeIcon, 
  CreditCardIcon, 
  ChartBarIcon, 
  UsersIcon,
  CogIcon,
  MenuIcon,
  TableIcon,
  ClipboardListIcon,
} from '@chakra-ui/icons';

interface NavItem {
  label: string;
  path: string;
  icon: any;
  color: string;
}

const NavigationMenu: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems: NavItem[] = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: HomeIcon,
      color: 'blue',
    },
    {
      label: 'Pagos',
      path: '/pagos',
      icon: CreditCardIcon,
      color: 'green',
    },
    {
      label: 'Historial Pagos',
      path: '/historial-pagos',
      icon: ChartBarIcon,
      color: 'purple',
    },
    {
      label: 'Órdenes',
      path: '/ordenes',
      icon: ClipboardListIcon,
      color: 'orange',
    },
    {
      label: 'Mesas',
      path: '/mesas',
      icon: TableIcon,
      color: 'teal',
    },
    {
      label: 'Usuarios',
      path: '/usuarios',
      icon: UsersIcon,
      color: 'pink',
    },
    {
      label: 'Configuración',
      path: '/config',
      icon: CogIcon,
      color: 'gray',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <Box
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      px={4}
      py={2}
      position="sticky"
      top={0}
      zIndex={10}
    >
      <HStack spacing={2} justify="space-between">
        <HStack spacing={2}>
          <Text fontSize="lg" fontWeight="bold" color="blue.600">
            🍽️ Restaurant Manager
          </Text>
        </HStack>
        
        <HStack spacing={1}>
          {navItems.map((item) => (
            <Button
              key={item.path}
              size="sm"
              variant={isActive(item.path) ? 'solid' : 'ghost'}
              colorScheme={item.color}
              leftIcon={<Icon as={item.icon} />}
              onClick={() => navigate(item.path)}
              _hover={{
                transform: 'translateY(-1px)',
                boxShadow: 'md',
              }}
              transition="all 0.2s"
            >
              {item.label}
            </Button>
          ))}
        </HStack>
      </HStack>
    </Box>
  );
};

export default NavigationMenu;