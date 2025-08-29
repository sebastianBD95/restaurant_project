'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, Input, Button, Text, Table, VStack, Accordion, Stack, Badge, Flex } from '@chakra-ui/react';
import { getMenus } from '../../services/menuService';
import { getCookie } from '../utils/cookieManager';
import { useParams } from 'react-router-dom';
import { MenuItemResponse } from '../../interfaces/menuItems';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { toaster } from '../../components/ui/toaster';
const RecipePage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { restaurantId } = useParams();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const token = getCookie(document.cookie, 'token');
      if (!token) {
        toaster.create({
          title: 'Error',
          description: 'No se encontró el token de autenticación',
          type: 'error',
          duration: 5000,
        });
        return;
      }
      const response = await getMenus(token, restaurantId!);
      setMenuItems(response as MenuItemResponse[]);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error al obtener los elementos del menú:',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTotalCost = (ingredients: MenuItemResponse['ingredients']) => {
    return ingredients.reduce((total, ing) => total + (ing.price || 0), 0);
  };

  if (loading) {
    return (
      <Flex height="100vh" direction={{ base: "column", md: "row" }}>
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          restaurantId={restaurantId}
        />
        <Box flex={1} p={6}>
          <Text>Cargando...</Text>
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
      <Box flex={1} p={{ base: 2, md: 6 }} overflowY="auto">
        <Box p={{ base: 4, md: 8 }} bg="gray.100" minH="100vh">
          <Heading mb={6}>🍽️ Platos e Ingredientes</Heading>

          <Accordion.Root collapsible>
            {menuItems.map((item) => (
              <Accordion.Item key={item.menu_item_id} value={item.menu_item_id}>
                <Accordion.ItemTrigger>
                  <Flex justify="space-between" align="center" p={4}>
                    <Box>
                      <Text fontSize="lg" fontWeight="bold">{item.name}</Text>
                      <Text color="gray.600">{item.description}</Text>
                    </Box>
                    <Badge colorScheme="green" fontSize="md">
                      ${(item.price || 0).toFixed(2)}
                    </Badge>
                  </Flex>
                </Accordion.ItemTrigger>
                <Accordion.ItemContent>
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Stack gap={4}>
                      <Box>
                        <Text fontWeight="semibold" mb={2}>Ingredientes</Text>
                        <Table.Root size="sm">
                          <Table.Header>
                            <Table.Row>
                              <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                              <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
                              <Table.ColumnHeader>Unidad</Table.ColumnHeader>
                              <Table.ColumnHeader textAlign="right">Precio</Table.ColumnHeader>
                            </Table.Row>
                          </Table.Header>
                          <Table.Body>
                            {item.ingredients.map((ingredient) => (
                              <Table.Row key={ingredient.ingredient_id}>
                                <Table.Cell>{ingredient.name}</Table.Cell>
                                <Table.Cell>{ingredient.amount}</Table.Cell>
                                <Table.Cell>{ingredient.unit}</Table.Cell>
                                <Table.Cell textAlign="right">${(ingredient.price || 0).toFixed(2)}</Table.Cell>
                              </Table.Row>
                            ))}
                          </Table.Body>
                        </Table.Root>
                      </Box>
                      <Flex justify="space-between" align="center" pt={2}>
                        <Text fontWeight="semibold">Costo Total:</Text>
                        <Text fontWeight="bold" color="green.500">
                          ${calculateTotalCost(item.ingredients).toFixed(2)}
                        </Text>
                      </Flex>
                    </Stack>
                  </Box>
                </Accordion.ItemContent>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </Box>
      </Box>
    </Flex>
  );
};

export default RecipePage;
