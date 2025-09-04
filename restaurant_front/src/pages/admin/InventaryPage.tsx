'use client';

import React, { useEffect, useState } from 'react';
import { Box, Button, Flex, Heading, Icon, Spinner, Text, Stack, Badge } from '@chakra-ui/react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
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

type UnidadMedida = 'g' | 'ml' | 'kg' | 'l' | 'unidad';

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

const UNIDADES: UnidadMedida[] = ['g', 'ml', 'kg', 'l', 'unidad'];

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
  const { isSidebarOpen, toggleSidebar } = useSidebar();

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

  // Load suggested ingredients
  useEffect(() => {
    const fetchSuggestedIngredients = async () => {
      try {
        setLoadingIngredients(true);
        const ingredients = await getIngredients(restaurantId!);
        setSuggestedIngredients(ingredients);
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: 'Error al cargar los ingredientes sugeridos',
          type: 'error',
          duration: 5000,
        });
      } finally {
        setLoadingIngredients(false);
      }
    };

    if (restaurantId) {
      fetchSuggestedIngredients();
    }
  }, [restaurantId]);

  // Handle category selection
  useEffect(() => {
    const fetchIngredientsByCategory = async () => {
      if (!selectedCategory) return;

      try {
        setLoadingIngredients(true);
        setFetchError('');
        const token = getCookie(document.cookie, 'token');
        if (!token) {
          throw new Error('No authentication token found');
        }
        const ingredients = await getRawIngredientsByCategory(selectedCategory, token);
        setCategoryIngredients(ingredients);
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: 'Error al cargar los ingredientes por categoría',
          type: 'error',
          duration: 5000,
        });
        setCategoryIngredients([]);
      } finally {
        setLoadingIngredients(false);
      }
    };

    fetchIngredientsByCategory();
  }, [selectedCategory]);

  const agregarAlimento = () => {
    setIsDialogOpen(true);
  };

  const selectIngredient = (ingredient: Ingredient) => {
    console.log(ingredient);
    const existingIngredient = inventario.find(
      (item) => item.id === ingredient.id
    );
    if (existingIngredient) {
      toaster.create({
        title: 'Ingrediente ya existe',
        description: 'Este ingrediente ya está en el inventario.',
        type: 'warning',
        duration: 3000,
      });
      setIsDialogOpen(false);
      return;
    }

    // Get the ingredient details from either suggested or category list
    const ingredientDetails =
      suggestedIngredients.find((i) => i.id === ingredient.id) ||
      categoryIngredients.find((i) => i.id === ingredient.id);

    if (!ingredientDetails) {
      toaster.create({
        title: 'Error',
        description: 'No se encontraron los detalles del ingrediente.',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    const nuevo: Inventory = {
      id: crypto.randomUUID(),
      raw_ingredient_id: ingredientDetails.id,
      nombre: ingredientDetails.name,
      categoria: ingredientDetails.category,
      cantidad: 0,
      unidad: 'g',
      cantidad_minima: 0,
      precio: 0,
      merma: 0,
      ultima_reposicion: new Date(),
      isNew: true,
    };

    setInventario((prev) => [...prev, nuevo]);
    setIsDialogOpen(false);
  };

  const DeleteInventory = async (id: string) => {
    try {
      const inventory = inventario.find((item) => item.id === id);
      if (inventory?.isNew) {
        setInventario((prev) => prev.filter((item) => item.id !== id));
        return;
      }
      await deleteInventoryItem(id, restaurantId!);
      setInventario((prev) => prev.filter((item) => item.id !== id));
      toaster.create({
        title: 'Eliminado',
        description: 'El ingrediente ha sido eliminado del inventario.',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo eliminar el ingrediente.',
        type: 'error',
        duration: 5000,
      });
    }
  };

  const handleChange = (id: string, field: keyof Inventory, value: string | number) => {
    setInventario((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value, isModified: true } : item))
    );
  };

  const toggleEditar = (id: string) => {
    setModoEdicion((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderIngredientList = (ingredients: Ingredient[], isLoading: boolean, error?: string) => {
    if (isLoading) {
      return <Spinner size="sm" />;
    }

    if (error) {
      return <Text color="red.500">{error}</Text>;
    }

    if (!ingredients.length) {
      return <Text color="gray.500">No hay ingredientes disponibles</Text>;
    }

    return (
      <Stack gap={2}>
        {ingredients.map((ingredient) => {
          const isAlreadyAdded = inventario.some(
            (item) => item.id === ingredient.id
          );

          return (
            <Box
              key={ingredient.id}
              p={4}
              borderWidth="1px"
              borderRadius="md"
              cursor={isAlreadyAdded ? 'not-allowed' : 'pointer'}
              opacity={isAlreadyAdded ? 0.5 : 1}
              _hover={{ bg: isAlreadyAdded ? undefined : 'gray.50' }}
              onClick={() => !isAlreadyAdded && selectIngredient(ingredient)}
            >
              <Flex justify="space-between" align="center">
                <Box>
                  <Text fontWeight="bold">{ingredient.name}</Text>
                  <Text color="gray.600">Categoría: {ingredient.category}</Text>
                </Box>
                {isAlreadyAdded && <Badge colorScheme="gray">Ya agregado</Badge>}
              </Flex>
            </Box>
          );
        })}
      </Stack>
    );
  };

  const handleSaveInventory = async () => {
    try {
      setSaving(true);
      const token = getCookie(document.cookie, 'token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Separate new and modified items
      const newItems = inventario.filter((item) => item.isNew);
      const modifiedItems = inventario.filter((item) => item.isModified && !item.isNew);

      if (newItems.length === 0 && modifiedItems.length === 0) {
        toaster.create({
          title: 'Sin cambios',
          description: 'No hay cambios para guardar en el inventario.',
          type: 'info',
          duration: 3000,
        });
        setSaving(false);
        return;
      }

      // Process new items
      if (newItems.length > 0) {
        const newInventoryItems = newItems.map((item) => ({
          raw_ingredient_id: item.raw_ingredient_id,
          quantity: item.cantidad,
          unit: item.unidad,
          minimum_quantity: item.cantidad_minima,
          last_restock_date: item.ultima_reposicion
            ? new Date(item.ultima_reposicion).toISOString()
            : new Date().toISOString(),
          price: item.precio,
        }));

        await createInventoryItems(restaurantId!, newInventoryItems, token);
      }

      // Process modified items
      if (modifiedItems.length > 0) {
        const modifiedInventoryItems = modifiedItems.map((item) => ({
          inventory_id: item.id,
          raw_ingredient_id: item.raw_ingredient_id,
          quantity: item.cantidad,
          unit: item.unidad,
          minimum_quantity: item.cantidad_minima,
          last_restock_date: item.ultima_reposicion
            ? new Date(item.ultima_reposicion).toISOString()
            : new Date().toISOString(),
          price: item.precio,
        }));

        await updateInventoryItems(restaurantId!, modifiedInventoryItems, token);
      }

      // After successful save, clear the modified flags
      setInventario((prev) =>
        prev.map((item) => ({
          ...item,
          isModified: false,
          isNew: false,
        }))
      );

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
    <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        restaurantId={restaurantId}
      />
      <Box flex={1} p={{ base: 2, md: 6 }} overflowY="auto">
        <Box p={{ base: 4, md: 8 }} bg="gray.100" minH="100vh">
          <Toaster />
          <Heading mb={4}>🧂 Inventario de Alimentos</Heading>

          <Flex justifyContent="space-between" alignItems="center" mb={4}>
            <Heading size="lg">Inventario</Heading>
            <Button onClick={agregarAlimento} colorScheme="blue">
              <Flex align="center" gap={2}>
                <Icon as={IoAddCircleOutline} />
                <Text>Agregar Ingrediente</Text>
              </Flex>
            </Button>
          </Flex>

          {loading ? (
            <Text>Cargando ingredientes...</Text>
          ) : (
            <>
              <InventoryTable
                inventario={inventario}
                modoEdicion={modoEdicion}
                onEdit={toggleEditar}
                onDelete={DeleteInventory}
                handleChange={handleChange}
                isLoading={loading}
              />

              <Box mt={6} display="flex" justifyContent="flex-end">
                <Button
                  colorScheme="blue"
                  size="lg"
                  disabled={saving}
                  onClick={handleSaveInventory}
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
            onSelectIngredient={selectIngredient}
            loadingIngredients={loadingIngredients}
            fetchError={fetchError}
            categories={CATEGORIAS}
          />
        </Box>
      </Box>
    </Flex>
  );
};

export default Inventario;
