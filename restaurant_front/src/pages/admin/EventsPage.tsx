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
import { ResponsiveSidebar } from '../../components/ui/ResponsiveSidebar';
import { useResponsive } from '../../hooks/useResponsive';
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
  const { isMobile, isTablet, isDesktop } = useResponsive();

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
      <div className="page-wrapper">
        <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
          <ResponsiveSidebar restaurantId={restaurantId} />
          <Box flex={1} display="flex" justifyContent="center" alignItems="center">
            <Spinner size="xl" />
          </Box>
        </Flex>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
        <ResponsiveSidebar restaurantId={restaurantId} />

        <Box 
          flex={1} 
          p={{ base: 3, sm: 4, md: 6, lg: 8 }} 
          overflowY="auto" 
          bg="gray.50"
          ml={{ base: 0, md: 0 }}
        >
          <Container maxW="container.xl" px={{ base: 2, sm: 4, md: 6 }}>
            <VStack gap={{ base: 4, md: 6, lg: 8 }} align="stretch">
              <Heading 
                textAlign="center" 
                size={{ base: 'xl', md: '2xl', lg: '3xl' }} 
                color="gray.800" 
                mb={{ base: 2, md: 4, lg: 6 }}
              >
                Calculadora de Eventos
              </Heading>

              <Text 
                textAlign="center" 
                fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} 
                color="gray.600" 
                mb={{ base: 4, md: 6, lg: 8 }}
                px={{ base: 2, md: 4 }}
              >
                Selecciona un plato del menú y especifica el número de personas para calcular la
                cantidad de ingredientes necesarios.
              </Text>

              <Grid 
                templateColumns={{ base: '1fr', lg: '1fr 1fr' }} 
                gap={{ base: 4, md: 6, lg: 8 }}
              >
                {/* Left Column - Menu Selection */}
                <GridItem>
                  <Box 
                    bg="white" 
                    borderRadius={{ base: 'sm', md: 'md', lg: 'lg' }} 
                    boxShadow={{ base: 'sm', md: 'md', lg: 'lg' }} 
                    mb={{ base: 3, md: 4, lg: 6 }}
                  >
                    <Box p={{ base: 3, md: 4, lg: 6 }} borderBottom="1px solid #e2e8f0">
                      <Heading size={{ base: 'md', md: 'lg', lg: 'xl' }}>
                        Seleccionar Plato
                      </Heading>
                    </Box>
                    <Box p={{ base: 3, md: 4, lg: 6 }}>
                      <VStack gap={{ base: 3, md: 4, lg: 5 }} align="stretch">
                        <CustomField label="Filtrar por categoría">
                          <NativeSelect.Root size={{ base: 'sm', md: 'md' }}>
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

                        <Box maxH={{ base: '300px', md: '400px' }} overflowY="auto">
                          <VStack gap={{ base: 2, md: 3, lg: 4 }} align="stretch">
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
                                borderRadius={{ base: 'sm', md: 'md' }}
                                _hover={{ bg: 'gray.50' }}
                                p={{ base: 2, md: 3, lg: 4 }}
                              >
                                <HStack gap={{ base: 2, md: 3, lg: 4 }}>
                                  <Image
                                    src={item.image_url}
                                    alt={item.name}
                                    boxSize={{ base: '40px', md: '50px', lg: '60px' }}
                                    objectFit="cover"
                                    borderRadius={{ base: 'sm', md: 'md' }}
                                  />
                                  <VStack align="start" gap={{ base: 1, md: 2 }} flex={1}>
                                    <Text 
                                      fontWeight="medium" 
                                      fontSize={{ base: 'xs', md: 'sm', lg: 'md' }}
                                    >
                                      {item.name}
                                    </Text>
                                    <Text 
                                      fontSize={{ base: 'xs', md: 'sm' }} 
                                      color="gray.600"
                                      noOfLines={2}
                                    >
                                      {item.description}
                                    </Text>
                                    <HStack>
                                      <Badge 
                                        colorScheme="blue" 
                                        fontSize={{ base: '0.7em', md: '0.8em' }}
                                      >
                                        {Object.entries(categoryMap).find(
                                          ([_, value]) => value === item.category
                                        )?.[0] || item.category}
                                      </Badge>
                                      <Text 
                                        fontSize={{ base: 'xs', md: 'sm' }} 
                                        color="gray.500"
                                      >
                                        {copFormatter.format(item.price)}
                                      </Text>
                                    </HStack>
                                  </VStack>
                                </HStack>
                              </Box>
                            ))}
                          </VStack>
                        </Box>

                        <HStack gap={{ base: 2, md: 3, lg: 4 }}>
                          <Button
                            colorScheme="blue"
                            onClick={calculateIngredients}
                            disabled={!selectedMenuItem || peopleCount <= 0}
                            flex={1}
                            size={{ base: 'sm', md: 'md', lg: 'lg' }}
                            fontSize={{ base: 'sm', md: 'md' }}
                          >
                            Calcular Ingredientes
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={resetCalculation} 
                            flex={1}
                            size={{ base: 'sm', md: 'md', lg: 'lg' }}
                            fontSize={{ base: 'sm', md: 'md' }}
                          >
                            Limpiar
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  </Box>
                </GridItem>

                {/* Right Column - Calculation Results */}
                <GridItem>
                  <Box 
                    bg="white" 
                    borderRadius={{ base: 'sm', md: 'md', lg: 'lg' }} 
                    boxShadow={{ base: 'sm', md: 'md', lg: 'lg' }} 
                    mb={{ base: 3, md: 4, lg: 6 }}
                  >
                    <Box p={{ base: 3, md: 4, lg: 6 }} borderBottom="1px solid #e2e8f0">
                      <Heading size={{ base: 'md', md: 'lg', lg: 'xl' }}>
                        Resultado del Cálculo
                      </Heading>
                    </Box>
                    <Box p={{ base: 3, md: 4, lg: 6 }}>
                      {eventCalculation ? (
                        <VStack gap={{ base: 3, md: 4, lg: 5 }} align="stretch">
                          <Box p={{ base: 3, md: 4, lg: 5 }} bg="blue.50" borderRadius={{ base: 'sm', md: 'md' }}>
                            <Text 
                              fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} 
                              fontWeight="bold" 
                              mb={{ base: 1, md: 2, lg: 3 }}
                            >
                              {eventCalculation.menuItem.name}
                            </Text>
                            <Text 
                              color="gray.600" 
                              mb={{ base: 1, md: 2, lg: 3 }}
                              fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
                            >
                              Para {eventCalculation.peopleCount} personas
                            </Text>
                            <Text 
                              fontSize={{ base: 'xs', md: 'sm', lg: 'md' }} 
                              color="gray.500"
                            >
                              {eventCalculation.menuItem.description}
                            </Text>
                          </Box>

                          <Box>
                            <Text 
                              fontSize={{ base: 'sm', md: 'md', lg: 'lg' }} 
                              fontWeight="semibold" 
                              mb={{ base: 2, md: 3, lg: 4 }}
                            >
                              Ingredientes Necesarios:
                            </Text>
                            <Box overflowX="auto">
                              <Table.Root size={{ base: 'xs', md: 'sm', lg: 'md' }}>
                                <Table.Header>
                                  <Table.Row>
                                    <Table.ColumnHeader fontSize={{ base: 'xs', md: 'sm' }}>
                                      Ingrediente
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader 
                                      textAlign="right"
                                      fontSize={{ base: 'xs', md: 'sm' }}
                                    >
                                      Cantidad
                                    </Table.ColumnHeader>
                                    <Table.ColumnHeader 
                                      textAlign="right"
                                      fontSize={{ base: 'xs', md: 'sm' }}
                                    >
                                      Costo
                                    </Table.ColumnHeader>
                                  </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                  {eventCalculation.ingredientTotals.map((ingredient) => (
                                    <Table.Row key={ingredient.ingredient_id}>
                                      <Table.Cell fontSize={{ base: 'xs', md: 'sm' }}>
                                        {ingredient.name}
                                      </Table.Cell>
                                      <Table.Cell 
                                        textAlign="right"
                                        fontSize={{ base: 'xs', md: 'sm' }}
                                      >
                                        {ingredient.totalAmount.toFixed(2)} {ingredient.unit}
                                      </Table.Cell>
                                      <Table.Cell 
                                        textAlign="right"
                                        fontSize={{ base: 'xs', md: 'sm' }}
                                      >
                                        {copFormatter.format(ingredient.totalPrice)}
                                      </Table.Cell>
                                    </Table.Row>
                                  ))}
                                </Table.Body>
                              </Table.Root>
                            </Box>
                          </Box>

                          <Box p={{ base: 3, md: 4, lg: 5 }} bg="green.50" borderRadius={{ base: 'sm', md: 'md' }}>
                            <HStack justify="space-between">
                              <Text 
                                fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} 
                                fontWeight="bold"
                              >
                                Costo Total de Ingredientes:
                              </Text>
                              <Text 
                                fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} 
                                fontWeight="bold" 
                                color="green.600"
                              >
                                {copFormatter.format(getTotalCost())}
                              </Text>
                            </HStack>
                            <Text 
                              fontSize={{ base: 'xs', md: 'sm', lg: 'md' }} 
                              color="gray.600" 
                              mt={{ base: 1, md: 2 }}
                            >
                              Precio por persona:{' '}
                              {copFormatter.format(getTotalCost() / eventCalculation.peopleCount)}
                            </Text>
                          </Box>
                        </VStack>
                      ) : (
                        <Box textAlign="center" py={{ base: 6, md: 8, lg: 10 }} color="gray.500">
                          <Text fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} mb={{ base: 1, md: 2, lg: 3 }}>
                            No hay cálculos disponibles
                          </Text>
                          <Text fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}>
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
    </div>
  );
};

export default EventsPage;
