import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Spinner,
  Badge,
  Flex,
  Table,
  Image,
  Container,
  NativeSelect,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { MenuItemResponse, MenuData } from '../../interfaces/menuItems';
import { getMenus } from '../../services/menuService';
import { getCookie } from '../utils/cookieManager';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { Toaster, toaster } from '../../components/ui/toaster';
import { CustomField } from '../../components/ui/field';
import { NumberInputRoot, NumberInputField } from '../../components/ui/number-input';

interface EventCalculation {
  menuItem: MenuItemResponse;
  peopleCount: number;
  ingredientTotals: {
    ingredient_id: string;
    name: string;
    totalAmount: number;
    unit: string;
    totalPrice: number;
  }[];
}

const EventsPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const navigate = useNavigate();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const [menuData, setMenuData] = useState<MenuData>({
    entrada: [],
    platoFuerte: [],
    postres: [],
    bebidas: [],
    sopas: [],
    ensaladas: [],
    extras: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedMenuItem, setSelectedMenuItem] = useState<MenuItemResponse | null>(null);
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [eventCalculation, setEventCalculation] = useState<EventCalculation | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryMap: Record<string, string> = {
    entrada: 'Appetizer',
    platoFuerte: 'Main',
    postres: 'Desserts',
    bebidas: 'Drinks',
    sopas: 'Soup',
    ensaladas: 'Salad',
    extras: 'Side',
  };

  const categoryLabels: Record<string, string> = {
    all: 'Todas las categorías',
    entrada: 'Entradas',
    platoFuerte: 'Platos Fuertes',
    postres: 'Postres',
    bebidas: 'Bebidas',
    sopas: 'Sopas',
    ensaladas: 'Ensaladas',
    extras: 'Extras',
  };

  // Colombian Peso formatter
  const copFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

  // Show error as a toast notification when error changes
  useEffect(() => {
    if (error) {
      toaster.create({
        title: 'Error',
        description: error,
        type: 'error',
        duration: 5000,
      });
    }
  }, [error]);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getCookie(document.cookie, 'token');
      if (!token) {
        setError('No authentication token found');
        navigate('/');
        return;
      }

      const response = await getMenus(token, restaurantId!);
      const menuItems = response as MenuItemResponse[];

      const appetizers = menuItems.filter((item) => item.category === 'Appetizer');
      const mainCourses = menuItems.filter((item) => item.category === 'Main');
      const desserts = menuItems.filter((item) => item.category === 'Desserts');
      const drinks = menuItems.filter((item) => item.category === 'Drinks');
      const soups = menuItems.filter((item) => item.category === 'Soup');
      const salads = menuItems.filter((item) => item.category === 'Salad');
      const sides = menuItems.filter((item) => item.category === 'Side');

      setMenuData({
        entrada: appetizers,
        platoFuerte: mainCourses,
        postres: desserts,
        bebidas: drinks,
        sopas: soups,
        ensaladas: salads,
        extras: sides,
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error cargando platos del menú.',
        type: 'error',
        duration: 5000,
      });
      setError('Error loading menu items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateIngredients = () => {
    if (!selectedMenuItem || peopleCount <= 0) {
      toaster.create({
        title: 'Error',
        description: 'Por favor selecciona un plato y especifica el número de personas.',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    const ingredientTotals = selectedMenuItem.ingredients.map((ingredient) => ({
      ingredient_id: ingredient.ingredient_id,
      name: ingredient.name,
      totalAmount: ingredient.amount * peopleCount,
      unit: ingredient.unit,
      totalPrice: ingredient.price * ingredient.amount * peopleCount,
    }));

    setEventCalculation({
      menuItem: selectedMenuItem,
      peopleCount,
      ingredientTotals,
    });

    toaster.create({
      title: 'Cálculo completado',
      description: `Ingredientes calculados para ${peopleCount} personas.`,
      type: 'success',
      duration: 3000,
    });
  };

  const resetCalculation = () => {
    setSelectedMenuItem(null);
    setPeopleCount(1);
    setEventCalculation(null);
    setSelectedCategory('all');
  };

  const getAllMenuItems = () => {
    return Object.values(menuData).flat();
  };

  const getFilteredMenuItems = () => {
    if (selectedCategory === 'all') {
      return getAllMenuItems();
    }
    return menuData[selectedCategory as keyof MenuData] || [];
  };

  const getTotalCost = () => {
    if (!eventCalculation) return 0;
    return eventCalculation.ingredientTotals.reduce(
      (total: number, ingredient) => total + ingredient.totalPrice,
      0
    );
  };

  if (isLoading) {
    return (
      <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
        <Sidebar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={toggleSidebar}
          restaurantId={restaurantId}
        />
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
          <Spinner size="xl" />
        </Box>
      </Flex>
    );
  }

  return (
    <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        restaurantId={restaurantId}
      />

      <Box flex={1} p={{ base: 4, md: 8 }} overflowY="auto" bg="gray.50">
        <Container maxW="container.xl">
          <VStack gap={6} align="stretch">
            <Heading textAlign="center" size="2xl" color="gray.800" mb={4}>
              Calculadora de Eventos
            </Heading>

            <Text textAlign="center" fontSize="lg" color="gray.600" mb={6}>
              Selecciona un plato del menú y especifica el número de personas para calcular la
              cantidad de ingredientes necesarios.
            </Text>

            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={8}>
              {/* Left Column - Menu Selection */}
              <GridItem>
                <Box bg="white" borderRadius="md" boxShadow="md" mb={4}>
                  <Box p={4} borderBottom="1px solid #e2e8f0">
                    <Heading size="lg">Seleccionar Plato</Heading>
                  </Box>
                  <Box p={4}>
                    <VStack gap={4} align="stretch">
                      <CustomField label="Filtrar por categoría">
                        <NativeSelect.Root size="sm">
                          <NativeSelect.Field
                            value={selectedCategory}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                              setSelectedCategory(e.target.value)
                            }
                          >
                            {Object.entries(categoryLabels).map(([key, label]) => (
                              <option key={key} value={key}>
                                {label}
                              </option>
                            ))}
                          </NativeSelect.Field>
                          <NativeSelect.Indicator />
                        </NativeSelect.Root>
                      </CustomField>

                      <CustomField label="Número de personas">
                        <NumberInputRoot
                          value={String(peopleCount)}
                          onValueChange={({ value }) => setPeopleCount(Number(value) || 1)}
                          min={1}
                          max={1000}
                        >
                          <NumberInputField />
                        </NumberInputRoot>
                      </CustomField>

                      <Box maxH="400px" overflowY="auto">
                        <VStack gap={3} align="stretch">
                          {getFilteredMenuItems().map((item) => (
                            <Box
                              key={item.menu_item_id}
                              cursor="pointer"
                              onClick={() => setSelectedMenuItem(item)}
                              bg={
                                selectedMenuItem?.menu_item_id === item.menu_item_id
                                  ? 'blue.50'
                                  : 'white'
                              }
                              borderColor={
                                selectedMenuItem?.menu_item_id === item.menu_item_id
                                  ? 'blue.200'
                                  : 'gray.200'
                              }
                              borderWidth="1px"
                              borderRadius="md"
                              _hover={{ bg: 'gray.50' }}
                              p={3}
                            >
                              <HStack gap={3}>
                                <Image
                                  src={item.image_url}
                                  alt={item.name}
                                  boxSize="50px"
                                  objectFit="cover"
                                  borderRadius="md"
                                />
                                <VStack align="start" gap={1} flex={1}>
                                  <Text fontWeight="medium" fontSize="sm">
                                    {item.name}
                                  </Text>
                                  <Text fontSize="xs" color="gray.600">
                                    {item.description}
                                  </Text>
                                  <HStack>
                                    <Badge colorScheme="blue" fontSize="0.8em">
                                      {Object.entries(categoryMap).find(
                                        ([_, value]) => value === item.category
                                      )?.[0] || item.category}
                                    </Badge>
                                    <Text fontSize="xs" color="gray.500">
                                      {copFormatter.format(item.price)}
                                    </Text>
                                  </HStack>
                                </VStack>
                              </HStack>
                            </Box>
                          ))}
                        </VStack>
                      </Box>

                      <HStack gap={3}>
                        <Button
                          colorScheme="blue"
                          onClick={calculateIngredients}
                          disabled={!selectedMenuItem || peopleCount <= 0}
                          flex={1}
                        >
                          Calcular Ingredientes
                        </Button>
                        <Button variant="outline" onClick={resetCalculation} flex={1}>
                          Limpiar
                        </Button>
                      </HStack>
                    </VStack>
                  </Box>
                </Box>
              </GridItem>

              {/* Right Column - Calculation Results */}
              <GridItem>
                <Box bg="white" borderRadius="md" boxShadow="md" mb={4}>
                  <Box p={4} borderBottom="1px solid #e2e8f0">
                    <Heading size="lg">Resultado del Cálculo</Heading>
                  </Box>
                  <Box p={4}>
                    {eventCalculation ? (
                      <VStack gap={4} align="stretch">
                        <Box p={4} bg="blue.50" borderRadius="md">
                          <Text fontSize="lg" fontWeight="bold" mb={2}>
                            {eventCalculation.menuItem.name}
                          </Text>
                          <Text color="gray.600" mb={2}>
                            Para {eventCalculation.peopleCount} personas
                          </Text>
                          <Text fontSize="sm" color="gray.500">
                            {eventCalculation.menuItem.description}
                          </Text>
                        </Box>

                        <Box>
                          <Text fontSize="md" fontWeight="semibold" mb={3}>
                            Ingredientes Necesarios:
                          </Text>
                          <Table.Root size="sm">
                            <Table.Header>
                              <Table.Row>
                                <Table.ColumnHeader>Ingrediente</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right">Cantidad</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right">Costo</Table.ColumnHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {eventCalculation.ingredientTotals.map((ingredient) => (
                                <Table.Row key={ingredient.ingredient_id}>
                                  <Table.Cell>{ingredient.name}</Table.Cell>
                                  <Table.Cell textAlign="right">
                                    {ingredient.totalAmount.toFixed(2)} {ingredient.unit}
                                  </Table.Cell>
                                  <Table.Cell textAlign="right">
                                    {copFormatter.format(ingredient.totalPrice)}
                                  </Table.Cell>
                                </Table.Row>
                              ))}
                            </Table.Body>
                          </Table.Root>
                        </Box>

                        <Box p={4} bg="green.50" borderRadius="md">
                          <HStack justify="space-between">
                            <Text fontSize="lg" fontWeight="bold">
                              Costo Total de Ingredientes:
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="green.600">
                              {copFormatter.format(getTotalCost())}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            Precio por persona:{' '}
                            {copFormatter.format(getTotalCost() / eventCalculation.peopleCount)}
                          </Text>
                        </Box>
                      </VStack>
                    ) : (
                      <Box textAlign="center" py={8} color="gray.500">
                        <Text fontSize="lg" mb={2}>
                          No hay cálculos disponibles
                        </Text>
                        <Text fontSize="sm">
                          Selecciona un plato y especifica el número de personas para ver los
                          resultados.
                        </Text>
                      </Box>
                    )}
                  </Box>
                </Box>
              </GridItem>
            </Grid>
          </VStack>
        </Container>
      </Box>
      <Toaster />
    </Flex>
  );
};

export default EventsPage;
