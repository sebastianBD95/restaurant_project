import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Heading,
  Spinner,
  Text,
  Flex,
  Button,
  Select,
  createListCollection,
  Portal,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { getIngredients } from '../../services/ingredientService';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { toaster } from '../../components/ui/toaster';
import { CustomField } from '../../components/ui/field';
import { IngredientTable } from '../../components/ingredients/IngredientTable';
import { deleteRawIngredient, updateRawIngredients } from '../../services/rawIngredientService';

interface IngredientRow {
  raw_ingredient_id: string;
  name: string;
  category: string;
  merma?: number;
}

const CATEGORIES = [
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

const categoryCollection = createListCollection({
  items: [
    { label: 'Todas las categorías', value: '' },
    ...CATEGORIES.map((cat) => ({ label: cat, value: cat })),
  ],
});

const IngredientPage: React.FC = () => {
  const { restaurantId } = useParams();
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string[]>(['']);
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editMode, setEditMode] = useState<{ [id: string]: boolean }>({});
  const [editedIngredients, setEditedIngredients] = useState<{ [id: string]: IngredientRow }>({});

  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setLoading(true);
        setError('');
        if (restaurantId) {
          const data = await getIngredients(restaurantId);
          setIngredients(
            data.map((item: any) => ({
              raw_ingredient_id: item.id,
              name: item.name,
              category: item.category,
              merma: item.merma,
            }))
          );
        }
      } catch (err) {
        setError('No se pudieron cargar los ingredientes.');
      } finally {
        setLoading(false);
      }
    };
    fetchIngredients();
  }, [restaurantId]);

  const filteredIngredients = selectedCategory[0]
    ? ingredients.filter((ingredient) => ingredient.category === selectedCategory[0])
    : ingredients;

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !restaurantId) return;
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:8080'}/raw-ingredients/upload?restaurant_id=${restaurantId}`,
        {
          method: 'POST',
          body: formData,
        }
      );
      if (!response.ok) throw new Error('Error al subir el archivo');
      toaster.create({
        title: 'CSV subido',
        type: 'success',
      });
      // Refresh ingredients
      const data = await getIngredients(restaurantId);
      setIngredients(
        data.map((item: any) => ({
          raw_ingredient_id: item.raw_ingredient_id,
          name: item.name,
          category: item.category,
          merma: item.merma,
        }))
      );
    } catch (err) {
      setError('No se pudo subir el archivo.');
      toaster.create({
        title: 'Error al subir el CSV',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleEditChange = (id: string, field: keyof IngredientRow, value: any) => {
    setEditedIngredients((prev) => ({
      ...prev,
      [id]: {
        ...ingredients.find((i) => i.raw_ingredient_id === id)!,
        ...prev[id],
        [field]: field === 'merma' ? (value === '' ? 0 : Number(value)) : value,
      },
    }));
    setIngredients((prev) =>
      prev.map((i) => (i.raw_ingredient_id === id ? { ...i, [field]: value } : i))
    );
  };

  const handleSave = async (id: string) => {
    const toUpdate = editedIngredients[id];
    if (!toUpdate) return;
    try {
      // Ensure merma is a number for backend
      const payload = {
        ...toUpdate,
        merma: typeof toUpdate.merma === 'number' ? toUpdate.merma : 0,
      };
      await updateRawIngredients([payload], restaurantId!);
      setEditedIngredients((prev) => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });
      toaster.create({
        title: 'Éxito',
        description: 'Ingrediente actualizado correctamente',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudo actualizar el ingrediente',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRawIngredient(id, restaurantId!);
      setIngredients((prev) => prev.filter((i) => i.raw_ingredient_id !== id));
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

  const hasEdited = Object.keys(editedIngredients).length > 0;

  const handleBulkSave = async () => {
    const toUpdate = Object.values(editedIngredients).map((ingredient) => ({
      ...ingredient,
      merma: typeof ingredient.merma === 'number' ? ingredient.merma : 0,
    }));
    if (toUpdate.length === 0) return;
    try {
      await updateRawIngredients(toUpdate, restaurantId!);
      setEditedIngredients({});
      toaster.create({
        title: 'Éxito',
        description: 'Ingredientes actualizados correctamente',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'No se pudieron actualizar los ingredientes',
        type: 'error',
        duration: 3000,
      });
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
          <Heading mb={6}>Ingredientes del Restaurante</Heading>
          <Box mb={4} width="100%">
            <Flex
              direction={{ base: 'column', sm: 'row' }}
              gap={3}
              align="center"
              justify="space-between"
            >
              <Box flex="1" width="100%">
                <CustomField label="Filtrar por categoría">
                  <Select.Root
                    collection={categoryCollection}
                    value={selectedCategory}
                    onValueChange={(val) => setSelectedCategory(val.value)}
                    size="md"
                    width="100%"
                    positioning={{ placement: 'bottom-start', flip: false }}
                  >
                    <Select.HiddenSelect />
                    <Select.Control>
                      <Select.Trigger>
                        <Select.ValueText placeholder="Filtrar por categoría" />
                      </Select.Trigger>
                      <Select.IndicatorGroup>
                        <Select.Indicator />
                      </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                      <Select.Positioner>
                        <Select.Content>
                          {categoryCollection.items.map((item) => (
                            <Select.Item item={item} key={item.value}>
                              {item.label}
                              <Select.ItemIndicator />
                            </Select.Item>
                          ))}
                        </Select.Content>
                      </Select.Positioner>
                    </Portal>
                  </Select.Root>
                </CustomField>
              </Box>
              <Button
                colorScheme="blue"
                onClick={handleUploadClick}
                loading={uploading}
                loadingText="Subiendo..."
                width={{ base: '100%', sm: 'auto' }}
                flex="none"
              >
                Subir CSV de ingredientes
              </Button>
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </Flex>
          </Box>
          {loading ? (
            <Spinner />
          ) : error ? (
            <Text color="red.500">{error}</Text>
          ) : (
            <IngredientTable
              ingredients={filteredIngredients}
              editMode={editMode}
              onEdit={handleEdit}
              onDelete={handleDelete}
              handleChange={handleEditChange}
              isLoading={loading}
              handleBulkSave={handleBulkSave}
              hasEdited={hasEdited}
            />
          )}
        </Box>
      </Box>
    </Flex>
  );
};

export default IngredientPage;
