'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Table, Accordion, Stack, Badge, Flex } from '@chakra-ui/react';
import { getMenus } from '../../services/menuService';
import { getCookie } from '../utils/cookieManager';
import { useParams } from 'react-router-dom';
import { MenuItemResponse } from '../../interfaces/menuItems';
import { ResponsiveSidebar } from '../../components/ui/ResponsiveSidebar';
import { useResponsive } from '../../hooks/useResponsive';
import { toaster } from '../../components/ui/toaster';

const RecipePage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { restaurantId } = useParams();
  const { isMobile, isTablet, isDesktop } = useResponsive();

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
      <div className="page-wrapper">
        <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
          <ResponsiveSidebar restaurantId={restaurantId} />
          <Box 
            flex={1} 
            p={{ base: 2, sm: 3, md: 4, lg: 6 }} 
            overflowY="auto"
            ml={{ base: 0, md: 0 }}
          >
            <Box 
              p={{ base: 3, sm: 4, md: 6, lg: 8 }} 
              bg="gray.100" 
              minH="100vh"
              borderRadius={{ base: 'none', md: 'md' }}
            >
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minH={{ base: '150px', md: '200px', lg: '250px' }}
              >
                <Text fontSize={{ base: 'lg', md: 'xl' }}>Cargando...</Text>
              </Box>
            </Box>
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
          p={{ base: 2, sm: 3, md: 4, lg: 6 }} 
          overflowY="auto"
          ml={{ base: 0, md: 0 }}
        >
          <Box 
            p={{ base: 3, sm: 4, md: 6, lg: 8 }} 
            bg="gray.100" 
            minH="100vh"
            borderRadius={{ base: 'none', md: 'md' }}
          >
            <Heading 
              mb={{ base: 4, md: 5, lg: 6 }}
              fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
              color="gray.800"
              textAlign={{ base: 'center', md: 'left' }}
            >
              🍽️ Platos e Ingredientes
            </Heading>

            <Accordion.Root collapsible>
              {menuItems.map((item) => (
                <Accordion.Item key={item.menu_item_id} value={item.menu_item_id}>
                  <Accordion.ItemTrigger>
                    <Flex 
                      justify="space-between" 
                      align="center" 
                      p={{ base: 3, md: 4 }}
                      flexDir={{ base: 'column', sm: 'row' }}
                      gap={{ base: 2, md: 0 }}
                    >
                      <Box 
                        textAlign={{ base: 'center', sm: 'left' }}
                        flex={1}
                      >
                        <Text 
                          fontSize={{ base: 'md', md: 'lg' }} 
                          fontWeight="bold"
                          mb={{ base: 1, md: 0 }}
                        >
                          {item.name}
                        </Text>
                        <Text 
                          color="gray.600"
                          fontSize={{ base: 'sm', md: 'md' }}
                        >
                          {item.description}
                        </Text>
                      </Box>
                      <Badge 
                        colorScheme="green" 
                        fontSize={{ base: 'sm', md: 'md' }}
                        alignSelf={{ base: 'center', sm: 'flex-end' }}
                      >
                        ${(item.price || 0).toFixed(2)}
                      </Badge>
                    </Flex>
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent>
                    <Box 
                      p={{ base: 3, md: 4 }} 
                      bg="gray.50" 
                      borderRadius="md"
                      mx={{ base: 2, md: 0 }}
                    >
                      <Stack gap={{ base: 3, md: 4 }}>
                        <Box>
                          <Text 
                            fontWeight="semibold" 
                            mb={{ base: 2, md: 3 }}
                            fontSize={{ base: 'md', md: 'lg' }}
                          >
                            Ingredientes
                          </Text>
                          <Box overflowX="auto">
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
                                    <Table.Cell textAlign="right">
                                      ${(ingredient.price || 0).toFixed(2)}
                                    </Table.Cell>
                                  </Table.Row>
                                ))}
                              </Table.Body>
                            </Table.Root>
                          </Box>
                        </Box>
                        <Flex 
                          justify="space-between" 
                          align="center" 
                          pt={2}
                          flexDir={{ base: 'column', sm: 'row' }}
                          gap={{ base: 2, sm: 0 }}
                        >
                          <Text 
                            fontWeight="semibold"
                            fontSize={{ base: 'sm', md: 'md' }}
                          >
                            Costo Total:
                          </Text>
                          <Text 
                            fontWeight="bold" 
                            color="green.500"
                            fontSize={{ base: 'lg', md: 'xl' }}
                          >
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
    </div>
  );
};

export default RecipePage;
