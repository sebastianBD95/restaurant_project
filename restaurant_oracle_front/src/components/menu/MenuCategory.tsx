import React from 'react';
import { Box, Grid, GridItem, Image, Text, Accordion, AbsoluteCenter } from '@chakra-ui/react';
import { MenuItemResponse } from '../../interfaces/menuItems';
import MenuItem from './MenuItemWaiter';
import MenuForm from './MenuForm';

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
  platoDisponible
}) => {
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
          />
        </AbsoluteCenter>
      </Box>
      <Accordion.ItemContent>
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
          {items.length > 0 && 
            items.map((item: MenuItemResponse) => (
              <MenuItem
                key={item.id}
                item={item}
                onAdd={onAddToCart}
                orderPlaced={orderPlaced}
                disabled={!platoDisponible(item.name)}
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