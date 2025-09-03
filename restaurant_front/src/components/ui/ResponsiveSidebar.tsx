import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  Icon,
  Flex,
  Button,
  useColorModeValue,
  Collapse,
  IconButton,
  Tooltip,
  Divider,
  Badge,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiBarChart2,
  FiShoppingCart,
  FiPackage,
  FiUsers,
  FiCalendar,
  FiDollarSign,
  FiMenu,
} from 'react-icons/fi';
import { MdOutlineInventory2, MdRestaurantMenu } from 'react-icons/md';
import { useResponsive, useResponsiveSidebar } from '../../hooks/useResponsive';
import { isWaiter } from '../../pages/utils/roleUtils';

interface SidebarItem {
  label: string;
  path: string;
  icon: React.ReactElement;
  badge?: number;
  isAdmin?: boolean;
  children?: SidebarItem[];
}

interface ResponsiveSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  restaurantId?: string;
}

export const ResponsiveSidebar: React.FC<ResponsiveSidebarProps> = ({
  isOpen,
  onToggle,
  restaurantId,
}) => {
  const location = useLocation();
  const params = useParams();
  const { isDisclosureOpen, onToggle: onDisclosureToggle } = useDisclosure();
  const { isMobile, isTablet } = useResponsive();
  const sidebarConfig = useResponsiveSidebar();
  
  const currentRestaurantId = restaurantId || params.restaurantId;

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const hoverBgColor = useColorModeValue('gray.100', 'gray.700');
  const activeBgColor = useColorModeValue('blue.50', 'blue.900');
  const activeTextColor = useColorModeValue('blue.600', 'blue.200');

  const sidebarItems: SidebarItem[] = [
    {
      label: 'Inicio',
      path: '/restaurantes',
      icon: <FiHome />,
      isAdmin: true,
    },
    {
      label: 'Dashboard',
      path: currentRestaurantId ? `/dashboard/${currentRestaurantId}` : '/dashboard',
      icon: <FiBarChart2 />,
      isAdmin: true,
    },
    {
      label: 'Gestión',
      path: '#',
      icon: <FiPackage />,
      isAdmin: true,
      children: [
        {
          label: 'Inventario',
          path: currentRestaurantId ? `/inventario/${currentRestaurantId}` : '/inventario',
          icon: <MdOutlineInventory2 />,
          isAdmin: true,
        },
        {
          label: 'Ingredientes',
          path: currentRestaurantId ? `/ingredientes/${currentRestaurantId}` : '/ingredientes',
          icon: <FiPackage />,
          isAdmin: true,
        },
        {
          label: 'Recetas',
          path: currentRestaurantId ? `/receta/${currentRestaurantId}` : '/receta',
          icon: <MdRestaurantMenu />,
          isAdmin: true,
        },
      ],
    },
    {
      label: 'Operaciones',
      path: '#',
      icon: <FiShoppingCart />,
      isAdmin: true,
      children: [
        {
          label: 'Menú',
          path: currentRestaurantId ? `/menu/${currentRestaurantId}` : '/menu',
          icon: <FiMenu />,
          isAdmin: true,
        },
        {
          label: 'Órdenes',
          path: currentRestaurantId ? `/ordenes/${currentRestaurantId}` : '/ordenes',
          icon: <FiShoppingCart />,
          badge: 5,
          isAdmin: true,
        },
        {
          label: 'Eventos',
          path: currentRestaurantId ? `/eventos/${currentRestaurantId}` : '/eventos',
          icon: <FiCalendar />,
          isAdmin: true,
        },
      ],
    },
    {
      label: 'Administración',
      path: '#',
      icon: <FiUsers />,
      isAdmin: true,
      children: [
        {
          label: 'Usuarios',
          path: currentRestaurantId ? `/usuarios/${currentRestaurantId}` : '/usuarios',
          icon: <FiUsers />,
          isAdmin: true,
        },
        {
          label: 'Pagos',
          path: currentRestaurantId ? `/pagos/${currentRestaurantId}` : '/pagos',
          icon: <FiDollarSign />,
          isAdmin: true,
        },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/restaurantes') {
      return location.pathname === path;
    }
    if (path === '#') {
      return false;
    }
    return location.pathname.startsWith(path);
  };

  const hasActiveChild = (item: SidebarItem): boolean => {
    if (item.children) {
      return item.children.some(child => isActive(child.path));
    }
    return isActive(item.path);
  };

  const renderSidebarItem = (item: SidebarItem, level: number = 0) => {
    if (item.isAdmin && isWaiter()) return null;

    const isItemActive = isActive(item.path);
    const hasActiveChildren = hasActiveChild(item);
    const paddingLeft = level * 4 + 4;

    if (item.children) {
      return (
        <Box key={item.path}>
          <Button
            w="full"
            justifyContent="flex-start"
            variant="ghost"
            size="sm"
            px={paddingLeft}
            py={3}
            onClick={onDisclosureToggle}
            bg={hasActiveChildren ? activeBgColor : 'transparent'}
            color={hasActiveChildren ? activeTextColor : textColor}
            fontWeight={hasActiveChildren ? 'semibold' : 'normal'}
            _hover={{ bg: hoverBgColor }}
            leftIcon={<Icon as={item.icon.type} />}
            rightIcon={
              <Icon
                as={isDisclosureOpen ? FiChevronRight : FiChevronLeft}
                transition="transform 0.2s"
                transform={isDisclosureOpen ? 'rotate(90deg)' : 'rotate(0deg)'}
              />
            }
          >
            {isOpen && <Text ml={2}>{item.label}</Text>}
          </Button>
          
          <Collapse in={isDisclosureOpen}>
            <VStack spacing={0} align="stretch">
              {item.children.map(child => renderSidebarItem(child, level + 1))}
            </VStack>
          </Collapse>
        </Box>
      );
    }

    return (
      <Link key={item.path} to={item.path}>
        <Flex
          align="center"
          px={paddingLeft}
          py={3}
          borderRadius="md"
          mx={2}
          _hover={{ bg: hoverBgColor }}
          bg={isItemActive ? activeBgColor : 'transparent'}
          color={isItemActive ? activeTextColor : textColor}
          fontWeight={isItemActive ? 'semibold' : 'normal'}
          transition="all 0.2s"
        >
          <Icon as={item.icon.type} fontSize="lg" />
          {isOpen && (
            <>
              <Text ml={3} flex={1}>
                {item.label}
              </Text>
              {item.badge && (
                <Badge colorScheme="red" variant="solid" borderRadius="full">
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Flex>
      </Link>
    );
  };

  const renderCollapsedSidebar = () => (
    <Box
      bg={bgColor}
      borderRightWidth="1px"
      borderColor={borderColor}
      w="60px"
      h="100vh"
      position="fixed"
      left={0}
      top={0}
      zIndex={999}
      transition="width 0.3s"
      overflow="hidden"
    >
      <VStack spacing={0} align="stretch" h="full">
        {/* Toggle Button */}
        <Box p={3} borderBottomWidth="1px" borderColor={borderColor}>
          <Tooltip label="Expandir sidebar" placement="right">
            <IconButton
              aria-label="Toggle sidebar"
              icon={<FiChevronRight />}
              onClick={onToggle}
              variant="ghost"
              size="sm"
              w="full"
            />
          </Tooltip>
        </Box>

        {/* Sidebar Items */}
        <VStack spacing={0} align="stretch" flex={1} py={4}>
          {sidebarItems.map(item => (
            <Tooltip key={item.path} label={item.label} placement="right">
              <Box>
                {renderSidebarItem(item)}
              </Box>
            </Tooltip>
          ))}
        </VStack>
      </VStack>
    </Box>
  );

  const renderExpandedSidebar = () => (
    <Box
      bg={bgColor}
      borderRightWidth="1px"
      borderColor={borderColor}
      w="250px"
      h="100vh"
      position="fixed"
      left={0}
      top={0}
      zIndex={999}
      transition="width 0.3s"
      overflowY="auto"
      overflowX="hidden"
    >
      <VStack spacing={0} align="stretch" h="full">
        {/* Header */}
        <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
          <Flex align="center" justify="space-between">
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Restaurante
            </Text>
            <Tooltip label="Colapsar sidebar" placement="bottom">
              <IconButton
                aria-label="Collapse sidebar"
                icon={<FiChevronLeft />}
                onClick={onToggle}
                variant="ghost"
                size="sm"
              />
            </Tooltip>
          </Flex>
        </Box>

        {/* Sidebar Items */}
        <VStack spacing={0} align="stretch" flex={1} py={4}>
          {sidebarItems.map(item => renderSidebarItem(item))}
        </VStack>

        {/* Footer */}
        <Box p={4} borderTopWidth="1px" borderColor={borderColor}>
          <Text fontSize="xs" color="gray.500" textAlign="center">
            v1.0.0
          </Text>
        </Box>
      </VStack>
    </Box>
  );

  const renderMobileSidebar = () => (
    <Box
      bg={bgColor}
      w="100%"
      h="100vh"
      position="fixed"
      left={0}
      top={0}
      zIndex={999}
      transform={isOpen ? 'translateX(0)' : 'translateX(-100%)'}
      transition="transform 0.3s"
      overflowY="auto"
      overflowX="hidden"
    >
      <VStack spacing={0} align="stretch" h="full">
        {/* Header */}
        <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
          <Flex align="center" justify="space-between">
            <Text fontSize="lg" fontWeight="bold" color={textColor}>
              Restaurante
            </Text>
            <IconButton
              aria-label="Close sidebar"
              icon={<FiChevronLeft />}
              onClick={onToggle}
              variant="ghost"
              size="sm"
            />
          </Flex>
        </Box>

        {/* Sidebar Items */}
        <VStack spacing={0} align="stretch" flex={1} py={4}>
          {sidebarItems.map(item => renderSidebarItem(item))}
        </VStack>
      </VStack>
    </Box>
  );

  // Don't render sidebar on mobile if not open
  if (isMobile && !isOpen) {
    return null;
  }

  // Render appropriate sidebar based on device and state
  if (isMobile) {
    return renderMobileSidebar();
  }

  if (isTablet) {
    return isOpen ? renderExpandedSidebar() : renderCollapsedSidebar();
  }

  // Desktop: always show sidebar, toggle between collapsed and expanded
  return isOpen ? renderExpandedSidebar() : renderCollapsedSidebar();
};

export default ResponsiveSidebar;