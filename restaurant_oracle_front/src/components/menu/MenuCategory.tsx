import React, { useState } from 'react';
import { Box, Grid, GridItem, Image, Text, Accordion, AbsoluteCenter, Button, ButtonGroup } from '@chakra-ui/react';
import { MenuItemResponse } from '../../interfaces/menuItems';
import MenuItem from './MenuItem';
import MenuForm from './MenuForm';
import { editMenuItem, hideMenuItem, deleteMenuItem } from '../../services/menuService';
import { getCookie } from '../../pages/utils/cookieManager';
import { isAdmin } from '../../pages/utils/roleUtils';
import { Ingredient } from '../../interfaces/ingredients';
import { toaster } from '../ui/toaster';

interface MenuCategoryProps {
  category: string;
  items: MenuItemResponse[];
  categoryMap: Record<string, string>;
  onSubmit: (e: React.FormEvent, category: string, ingredients: Ingredient[], item?: MenuItemResponse) => Promise<void>;
  error: string;
  MAX_FILE_SIZE: number;
  onAddToCart: (item: MenuItemResponse, quantity: number, observation: string, selectedSides: string[]) => void;
  orderPlaced: boolean;
  platoDisponible: (platoName: string) => boolean;
  formData: {
    name: string;
    description: string;
    price: number;
    sideDishes: number;
  };
  setFormData: (data: { name: string; description: string; price: number; sideDishes: number }) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  onMenuUpdate: () => Promise<void>;
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
  allMenuItems: MenuItemResponse[];
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
  formData,
  setFormData,
  file,
  setFile,
  onMenuUpdate,
  ingredients,
  setIngredients,
  allMenuItems
}) => {
  const token = getCookie(document.cookie, 'token');
  const restaurantId = window.location.pathname.split('/').find((v, i, arr) => arr[i-1] === 'menu') || '';
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItemResponse | undefined>(undefined);

  const handleEdit = async (item: MenuItemResponse) => {
    console.log(item);
    setEditingItem(item);
    setFormData({
      name: item.name,  
      description: item.description,
      price: item.price,
      sideDishes: item.side_dishes,
    });
    setIsFormOpen(true);
  };

  const handleFormClose = () => {
    setEditingItem(undefined);
    setFormData({
      name: '',
      description: '',
      price: 0,
      sideDishes: 0,
    });
    setIsFormOpen(false);
  };

  const handleDelete = async (item: MenuItemResponse) => {
    try {
      await deleteMenuItem(item.menu_item_id, token!, restaurantId);
      await onMenuUpdate();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error eliminando plato.',
        type: 'error',
        duration: 5000,
      });
    }
  };

  const handleHide = async (item: MenuItemResponse) => {
    try {
      await hideMenuItem(item.menu_item_id, token!, restaurantId);
      await onMenuUpdate();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error ocultando plato.',
        type: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <Accordion.Item key={category} value={category}>
      <Box position="relative">
        <Accordion.ItemTrigger>
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            py={{ base: 2, md: 3 }}
            w="100%" 
          >
            <Box
              textAlign="left"
              fontSize={{ base: "md", md: "lg" }}
              fontWeight="bold"
              textTransform="capitalize"
            >
              {category.replace(/([A-Z])/g, ' $1').trim()}
            </Box>
            {isAdmin() && (
              <Button
                colorScheme="blue"
                onClick={() => setIsFormOpen(true)}
                size={{ base: "sm", md: "md" }}
                fontSize={{ base: "sm", md: "md" }}
                ml="auto"
              >
                Añadir Plato
              </Button>
            )}
          </Box>
        </Accordion.ItemTrigger>
        <AbsoluteCenter axis="vertical" insetEnd={{ base: 2, md: 4 }}>
          <MenuForm
            category={category}
            categoryMap={categoryMap}
            onSubmit={(e) => onSubmit(e, category, ingredients, editingItem)}
            error={error}
            MAX_FILE_SIZE={MAX_FILE_SIZE}
            isOpen={isFormOpen}
            setIsOpen={handleFormClose}
            formData={formData}
            setFormData={setFormData}
            file={file}
            setFile={setFile}
            initialData={editingItem}
            ingredients={ingredients}
            setIngredients={setIngredients}
          />
        </AbsoluteCenter>
      </Box>
      <Accordion.ItemContent>
        <Grid 
          templateColumns={{ 
            base: '1fr', 
            sm: 'repeat(2, 1fr)', 
            md: 'repeat(2, 1fr)',
            lg: 'repeat(3, 1fr)'
          }} 
          gap={{ base: 4, md: 6 }}
        >
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
                allMenuItems={allMenuItems}
              />
            ))
          }
          {items.length === 0 && (
            <GridItem colSpan={{ base: 1, sm: 2, md: 2, lg: 3 }} display="flex" justifyContent="center">
              <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                mt={{ base: 6, md: 12 }}
                p={{ base: 4, md: 6 }}
                bg="white"
                borderRadius="md"
                boxShadow="md"
                maxW="400px"
                mx="auto"
                w="100%"
              >
                <Text 
                  fontSize={{ base: "lg", md: "xl" }} 
                  fontWeight="semibold" 
                  mb={4} 
                  color="gray.700"
                >
                  No has agregado ningún plato aún
                </Text>
                <Image
                  src="/images/plate.png"
                  alt="Chef tasting plate"
                  boxSize={{ base: "200px", md: "250px" }}
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