import React, { useState } from 'react';
import { Box, Grid, GridItem, Image, Text, Accordion, AbsoluteCenter } from '@chakra-ui/react';
import { MenuItemResponse } from '../../interfaces/menuItems';
import MenuItem from './MenuItemWaiter';
import MenuForm from './MenuForm';
import { editMenuItem, hideMenuItem, deleteMenuItem } from '../../services/menuService';
import { getCookie } from '../../pages/utils/cookieManager';

interface MenuCategoryProps {
  category: string;
  items: MenuItemResponse[];
  categoryMap: Record<string, string>;
  onSubmit: (e: React.FormEvent, category: string) => Promise<void>;
  error: string;
  MAX_FILE_SIZE: number;
  onAddToCart: (item: MenuItemResponse, quantity: number, observation: string) => void;
  orderPlaced: boolean;
  platoDisponible: (platoName: string) => boolean;
}

const MenuCategory: React.FC<MenuCategoryProps> = ({
  category,
  items,
  categoryMap,
  onSubmit,
  error,
  MAX_FILE_SIZE,
  onAddToCart,
  orderPlaced,
  platoDisponible,
}) => {
  const token = getCookie(document.cookie, 'token');
  const restaurantId = window.location.pathname.split('/').find((v, i, arr) => arr[i-1] === 'menu') || '';
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleEdit = async (item: MenuItemResponse) => {
    // Implement edit logic here (e.g., open modal, then call editMenuItem)
    // await editMenuItem(item.menu_item_id, { ... }, token, restaurantId!);
    console.log('Editando:', item);
    setIsFormOpen(true);
  };

  const handleDelete = async (item: MenuItemResponse) => {
    await deleteMenuItem(item.menu_item_id, token!, restaurantId);
    window.location.reload();
  };

  const handleHide = async (item: MenuItemResponse) => {
    await hideMenuItem(item.menu_item_id, token!, restaurantId);
    window.location.reload();
  };

  return (
    <Accordion.Item key={category} value={category}>
      <Box position="relative">
        <Accordion.ItemTrigger>
          <Box
            flex="1"
            textAlign="left"
            fontSize="lg"
            fontWeight="bold"
            textTransform="capitalize"
          >
            {category.replace(/([A-Z])/g, ' $1').trim()}
          </Box>
        </Accordion.ItemTrigger>
        <AbsoluteCenter axis="vertical" insetEnd="0">
          <MenuForm
            category={category}
            categoryMap={categoryMap}
            onSubmit={onSubmit}
            error={error}
            MAX_FILE_SIZE={MAX_FILE_SIZE}
            isOpen={isFormOpen}
            setIsOpen={setIsFormOpen}
          />
        </AbsoluteCenter>
      </Box>
      <Accordion.ItemContent>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          {items.length > 0 && 
            items.map((item: MenuItemResponse) => (
              <MenuItem
                key={item.menu_item_id}
                item={item}
                onAdd={onAddToCart}
                orderPlaced={orderPlaced}
                disabled={!platoDisponible(item.name)}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onHide={handleHide}
              />
            ))
          }
          {items.length === 0 && (
            <GridItem colSpan={{ base: 1, md: 2 }} display="flex" justifyContent="center">
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                mt={12}
                p={6}
                bg="white"
                borderRadius="md"
                boxShadow="md"
                maxW="400px"
                mx="auto"
              >
                <Text fontSize="xl" fontWeight="semibold" mb={4} color="gray.700">
                  No has agregado ningún plato aún
                </Text>
                <Image
                  src="/images/plate.png"
                  alt="Chef tasting plate"
                  boxSize="250px"
                  objectFit="contain"
                  borderRadius="md"
                />
              </Box>
            </GridItem>
          )}
        </Grid>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
};

export default MenuCategory; 