import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Grid,
  GridItem,
  Spinner,
  Badge,
  Flex,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableColumnHeader,
  Image,
  Container,
  Stack,
  Field,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  NativeSelect,
  Divider
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { MenuItemResponse, MenuData } from '../../interfaces/menuItems';
import { getMenus } from '../../services/menuService';
import { getCookie } from '../utils/cookieManager';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { Toaster, toaster } from '../../components/ui/toaster';

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

  useEffect(() => {
    fetchMenuItems();
  }, [restaurantId]);

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

      const appetizers = menuItems.filter(item => item.category === 'Appetizer');
      const mainCourses = menuItems.filter(item => item.category === 'Main');
      const desserts = menuItems.filter(item => item.category === 'Desserts');
      const drinks = menuItems.filter(item => item.category === 'Drinks');
      const soups = menuItems.filter(item => item.category === 'Soup');
      const salads = menuItems.filter(item => item.category === 'Salad');
      const sides = menuItems.filter(item => item.category === 'Side');

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
    return eventCalculation.ingredientTotals.reduce((total: number, ingredient) => total + ingredient.totalPrice, 0);
  };

  if (isLoading) {
    return (
      <Flex height="100vh" direction={{ base: "column", md: "row" }}>
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
    <Flex height="100vh" direction={{ base: "column", md: "row" }}>
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        restaurantId={restaurantId}
      />

      <Box flex={1} p={{ base: 4, md: 8 }} overflowY="auto" bg="gray.50">
        <Container maxW="container.xl">
          <VStack spacing={6} align="stretch">
            <Heading 
              textAlign="center" 
              size="2xl" 
              color="gray.800"
              mb={4}
            >
              Calculadora de Eventos
            </Heading>

            <Text 
              textAlign="center" 
              fontSize="lg" 
              color="gray.600"
              mb={6}
            >
              Selecciona un plato del menú y especifica el número de personas para calcular la cantidad de ingredientes necesarios.
            </Text>

            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                <AlertTitle>Error:</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={8}>
              {/* Left Column - Menu Selection */}
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="lg">Seleccionar Plato</Heading>
                  </CardHeader>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Field label="Filtrar por categoría">
                        <NativeSelect 
                          value={selectedCategory} 
                          onChange={(e) => setSelectedCategory(e.target.value)}
                        >
                          {Object.entries(categoryLabels).map(([key, label]) => (
                            <option key={key} value={key}>
                              {label}
                            </option>
                          ))}
                        </NativeSelect>
                      </Field>

                      <Field label="Número de personas">
                                                 <NumberInput
                           value={peopleCount}
                           onChange={(valueAsString: string, valueAsNumber: number) => setPeopleCount(valueAsNumber || 1)}
                           min={1}
                           max={1000}
                         >
                          <NumberInputField />
                          <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                          </NumberInputStepper>
                        </NumberInput>
                      </Field>

                      <Box maxH="400px" overflowY="auto">
                        <VStack spacing={3} align="stretch">
                          {getFilteredMenuItems().map((item) => (
                            <Card 
                              key={item.menu_item_id}
                              cursor="pointer"
                              onClick={() => setSelectedMenuItem(item)}
                              bg={selectedMenuItem?.menu_item_id === item.menu_item_id ? "blue.50" : "white"}
                              borderColor={selectedMenuItem?.menu_item_id === item.menu_item_id ? "blue.200" : "gray.200"}
                              _hover={{ bg: "gray.50" }}
                              size="sm"
                            >
                              <CardBody>
                                <HStack spacing={3}>
                                  <Image 
                                    src={item.image_url} 
                                    alt={item.name}
                                    boxSize="50px"
                                    objectFit="cover"
                                    borderRadius="md"
                                    fallback={
                                      <Box 
                                        boxSize="50px" 
                                        bg="gray.200" 
                                        borderRadius="md"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                      >
                                        <Text fontSize="xs" color="gray.500">IMG</Text>
                                      </Box>
                                    }
                                  />
                                  <VStack align="start" spacing={1} flex={1}>
                                    <Text fontWeight="medium" fontSize="sm">
                                      {item.name}
                                    </Text>
                                    <Text fontSize="xs" color="gray.600" noOfLines={2}>
                                      {item.description}
                                    </Text>
                                    <HStack>
                                      <Badge colorScheme="blue" size="sm">
                                        {Object.entries(categoryMap).find(([_, value]) => value === item.category)?.[0] || item.category}
                                      </Badge>
                                      <Text fontSize="xs" color="gray.500">
                                        ${item.price}
                                      </Text>
                                    </HStack>
                                  </VStack>
                                </HStack>
                              </CardBody>
                            </Card>
                          ))}
                        </VStack>
                      </Box>

                      <HStack spacing={3}>
                        <Button 
                          colorScheme="blue" 
                          onClick={calculateIngredients}
                          disabled={!selectedMenuItem || peopleCount <= 0}
                          flex={1}
                        >
                          Calcular Ingredientes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={resetCalculation}
                          flex={1}
                        >
                          Limpiar
                        </Button>
                      </HStack>
                    </VStack>
                  </CardBody>
                </Card>
              </GridItem>

              {/* Right Column - Calculation Results */}
              <GridItem>
                <Card>
                  <CardHeader>
                    <Heading size="lg">Resultado del Cálculo</Heading>
                  </CardHeader>
                  <CardBody>
                    {eventCalculation ? (
                      <VStack spacing={4} align="stretch">
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

                        <Divider />

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
                                    ${ingredient.totalPrice.toFixed(2)}
                                  </Table.Cell>
                                </Table.Row>
                              ))}
                            </Table.Body>
                          </Table.Root>
                        </Box>

                        <Divider />

                        <Box p={4} bg="green.50" borderRadius="md">
                          <HStack justify="space-between">
                            <Text fontSize="lg" fontWeight="bold">
                              Costo Total de Ingredientes:
                            </Text>
                            <Text fontSize="lg" fontWeight="bold" color="green.600">
                              ${getTotalCost().toFixed(2)}
                            </Text>
                          </HStack>
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            Precio por persona: ${(getTotalCost() / eventCalculation.peopleCount).toFixed(2)}
                          </Text>
                        </Box>
                      </VStack>
                    ) : (
                      <Box 
                        textAlign="center" 
                        py={8}
                        color="gray.500"
                      >
                        <Text fontSize="lg" mb={2}>
                          No hay cálculos disponibles
                        </Text>
                        <Text fontSize="sm">
                          Selecciona un plato y especifica el número de personas para ver los resultados.
                        </Text>
                      </Box>
                    )}
                  </CardBody>
                </Card>
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