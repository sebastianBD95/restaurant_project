'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Icon, Spinner, Text, Stack, Badge } from '@chakra-ui/react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { useParams } from 'react-router-dom';
import { ResponsiveSidebar } from '../../components/ui/ResponsiveSidebar';
import { useResponsive } from '../../hooks/useResponsive';
import { getCookie } from '../utils/cookieManager';
import { Toaster, toaster } from '../../components/ui/toaster';
import { AddIngredientDialog } from '../../components/inventory/AddIngredientDialog';
import { InventoryTable } from '../../components/inventory/InventoryTable';
import { getIngredients, Ingredient } from '../../services/ingredientService';
import { getRawIngredientsByCategory } from '../../services/rawIngredientService';
import {
  deleteInventoryItem,
  getInventory,
  createInventoryItems,
  updateInventoryItems,
} from '../../services/inventoryService';
import type { Inventory } from '../../interfaces/inventory';

interface CustomIngredient {
  nombre: string;
  categoria: string;
}

type UnidadMedida = 'g' | 'ml' | 'kg' | 'l' | 'un';

const CATEGORIAS = [
  'Pollo',
  'Fruta',
  'Lácteo',
  'Res',
  'Cerdo',
  'Condimento',
  'Cereal',
  'Pescado',
  'Grano',
  'Harina',
  'Hongo',
  'Grasa',
  'Legumbre',
  'Verdura',
  'Marisco',
  'Otro',
];

const UNIDADES: UnidadMedida[] = ['g', 'ml', 'kg', 'l', 'un'];

const Inventario: React.FC = () => {
  const [inventario, setInventario] = useState<Inventory[]>([]);
  const [modoEdicion, setModoEdicion] = useState<{ [id: string]: boolean }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [suggestedIngredients, setSuggestedIngredients] = useState<Ingredient[]>([]);
  const [categoryIngredients, setCategoryIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [customIngredient, setCustomIngredient] = useState<CustomIngredient>({
    nombre: '',
    categoria: '',
  });
  const { restaurantId } = useParams();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Load initial inventory
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        const inventoryData = await getInventory(restaurantId!);

        // Transform inventory data to match our local format
        const transformedInventory: Inventory[] = inventoryData.map((item) => ({
          id: item.inventory_id,
          raw_ingredient_id: item.raw_ingredient_id,
          nombre: item.raw_ingredient.name,
          categoria: item.raw_ingredient.category,
          cantidad: item.quantity,
          unidad: item.unit,
          cantidad_minima: item.minimum_quantity,
          precio: item.price,
          merma: item.raw_ingredient.merma,
          ultima_reposicion: item.last_restock_date ? new Date(item.last_restock_date) : undefined,
        }));

        setInventario(transformedInventory);
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: 'No se pudo cargar el inventario.',
          type: 'error',
          duration: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchInventory();
    }
  }, [restaurantId]);

  // Load suggested ingredients when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      loadSuggestedIngredients();
    }
  }, [isDialogOpen]);

  const loadSuggestedIngredients = async () => {
    try {
      setLoadingIngredients(true);
      setFetchError('');
      const ingredients = await getIngredients(restaurantId!);
      setSuggestedIngredients(ingredients);
    } catch (error) {
      setFetchError('No se pudieron cargar los ingredientes sugeridos.');
    } finally {
      setLoadingIngredients(false);
    }
  };

  const loadCategoryIngredients = async (category: string) => {
    try {
      setLoadingIngredients(true);
      setFetchError('');
      const ingredients = await getRawIngredientsByCategory(category, restaurantId!);
      setCategoryIngredients(ingredients);
    } catch (error) {
      setFetchError('No se pudieron cargar los ingredientes de la categoría seleccionada.');
    } finally {
      setLoadingIngredients(false);
    }
  };

  const agregarAlimento = () => {
    setIsDialogOpen(true);
  };

  const seleccionarIngrediente = (ingredient: Ingredient) => {
    const newItem: Inventory = {
      id: `temp-${Date.now()}`,
      raw_ingredient_id: ingredient.id,
      nombre: ingredient.name,
      categoria: ingredient.category,
      cantidad: 0,
      unidad: 'g' as UnidadMedida,
      cantidad_minima: 0,
      precio: 0,
      merma: ingredient.merma || 0,
      ultima_reposicion: undefined,
    };

    setInventario((prev) => [...prev, newItem]);
    setModoEdicion((prev) => ({ ...prev, [newItem.id]: true }));
    setIsDialogOpen(false);
  };

  const toggleEditar = (id: string) => {
    setModoEdicion((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChange = (id: string, field: keyof Inventory, value: any) => {
    setInventario((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const eliminarAlimento = (id: string) => {
    setInventario((prev) => prev.filter((item) => item.id !== id));
    setModoEdicion((prev) => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const handleSaveInventory = async () => {
    try {
      setSaving(true);

      // Separate new items from existing ones
      const newItems: any[] = [];
      const modifiedItems: any[] = [];

      inventario.forEach((item) => {
        if (item.id.startsWith('temp-')) {
          // This is a new item
          newItems.push({
            raw_ingredient_id: item.raw_ingredient_id,
            quantity: item.cantidad,
            unit: item.unidad,
            minimum_quantity: item.cantidad_minima,
            price: item.precio,
          });
        } else {
          // This is an existing item that might have been modified
          modifiedItems.push({
            inventory_id: item.id,
            raw_ingredient_id: item.raw_ingredient_id,
            quantity: item.cantidad,
            unit: item.unidad,
            minimum_quantity: item.cantidad_minima,
            price: item.precio,
          });
        }
      });

      // Create new inventory items
      if (newItems.length > 0) {
        await createInventoryItems(newItems, restaurantId!);
      }

      // Update existing inventory items
      if (modifiedItems.length > 0) {
        await updateInventoryItems(modifiedItems, restaurantId!);
      }

      toaster.create({
        title: 'Inventario guardado',
        description: `Se guardaron ${newItems.length} items nuevos y ${modifiedItems.length} items modificados exitosamente.`,
        type: 'success',
        duration: 5000,
      });

      // Refresh the inventory to get the updated data from the server
      const updatedInventory = await getInventory(restaurantId!);
      const transformedInventory: Inventory[] = updatedInventory.map((item) => ({
        id: item.inventory_id,
        raw_ingredient_id: item.raw_ingredient_id,
        nombre: item.raw_ingredient.name,
        categoria: item.raw_ingredient.category,
        cantidad: item.quantity,
        unidad: item.unit,
        cantidad_minima: item.minimum_quantity,
        precio: item.price,
        merma: item.merma,
        ultima_reposicion: item.last_restock_date ? new Date(item.last_restock_date) : undefined,
      }));
      setInventario(transformedInventory);
    } catch (error) {
      toaster.create({
        title: 'Error al guardar',
        description: 'No se pudo guardar el inventario. Por favor, intente nuevamente.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setSaving(false);
    }
  };

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
            <Toaster />
            <Heading 
              mb={{ base: 3, md: 4, lg: 6 }}
              fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
              color="gray.800"
              textAlign={{ base: 'center', md: 'left' }}
            >
              🧂 Inventario de Alimentos
            </Heading>

            <Flex 
              justifyContent="space-between" 
              alignItems="center" 
              mb={{ base: 3, md: 4, lg: 6 }}
              flexDir={{ base: 'column', sm: 'row' }}
              gap={{ base: 3, md: 4 }}
            >
              <Heading 
                size={{ base: 'md', md: 'lg', lg: 'xl' }}
                textAlign={{ base: 'center', sm: 'left' }}
              >
                Inventario
              </Heading>
              <Button 
                onClick={agregarAlimento} 
                colorScheme="blue"
                size={{ base: 'sm', md: 'md', lg: 'lg' }}
                fontSize={{ base: 'sm', md: 'md' }}
                width={{ base: 'full', sm: 'auto' }}
              >
                <Flex align="center" gap={{ base: 1, md: 2 }}>
                  <Icon as={IoAddCircleOutline} />
                  <Text>Agregar Ingrediente</Text>
                </Flex>
              </Button>
            </Flex>

            {loading ? (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minH={{ base: '150px', md: '200px', lg: '250px' }}
              >
                <Text fontSize={{ base: 'md', md: 'lg' }}>
                  Cargando ingredientes...
                </Text>
              </Box>
            ) : (
              <>
                <InventoryTable
                  inventario={inventario}
                  modoEdicion={modoEdicion}
                  onEdit={toggleEditar}
                  onDelete={eliminarAlimento}
                  handleChange={handleChange}
                  isLoading={loading}
                />

                <Box 
                  mt={{ base: 4, md: 5, lg: 6 }} 
                  display="flex" 
                  justifyContent={{ base: 'center', md: 'flex-end' }}
                >
                  <Button
                    colorScheme="blue"
                    size={{ base: 'md', md: 'lg', lg: 'xl' }}
                    disabled={saving}
                    onClick={handleSaveInventory}
                    fontSize={{ base: 'sm', md: 'md' }}
                    width={{ base: 'full', md: 'auto' }}
                  >
                    {saving ? '💾 Guardando...' : '💾 Guardar Inventario'}
                  </Button>
                </Box>
              </>
            )}

            <AddIngredientDialog
              isOpen={isDialogOpen}
              onClose={() => setIsDialogOpen(false)}
              suggestedIngredients={suggestedIngredients}
              categoryIngredients={categoryIngredients}
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              onSelectIngredient={seleccionarIngrediente}
              loadingIngredients={loadingIngredients}
              fetchError={fetchError}
              categories={CATEGORIAS}
            />
          </Box>
        </Box>
      </Flex>
    </div>
  );
};

export default Inventario;
