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
import { ResponsiveSidebar } from '../../components/ui/ResponsiveSidebar';
import { useResponsive } from '../../hooks/useResponsive';
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
  const { isMobile, isTablet, isDesktop } = useResponsive();
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
          console.log(data);
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      toaster.create({
        title: 'Error',
        description: 'Por favor, selecciona un archivo CSV válido.',
        type: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('restaurant_id', restaurantId!);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toaster.create({
        title: 'Éxito',
        description: 'Archivo CSV subido correctamente.',
        type: 'success',
        duration: 3000,
      });

      // Refresh ingredients list
      const data = await getIngredients(restaurantId!);
      setIngredients(
        data.map((item: any) => ({
          raw_ingredient_id: item.id,
          name: item.name,
          category: item.category,
          merma: item.merma,
        }))
      );
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error al subir el archivo CSV.',
        type: 'error',
        duration: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (id: string) => {
    setEditMode((prev) => ({ ...prev, [id]: !prev[id] }));
    if (!editMode[id]) {
      setEditedIngredients((prev) => ({
        ...prev,
        [id]: ingredients.find((ing) => ing.raw_ingredient_id === id)!,
      }));
    } else {
      setEditedIngredients((prev) => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    }
  };

  const handleEditChange = (id: string, field: keyof IngredientRow, value: string | number) => {
    setEditedIngredients((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteRawIngredient(id);
      setIngredients((prev) => prev.filter((ing) => ing.raw_ingredient_id !== id));
      toaster.create({
        title: 'Éxito',
        description: 'Ingrediente eliminado correctamente.',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error al eliminar el ingrediente.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const handleBulkSave = async () => {
    try {
      const editedValues = Object.values(editedIngredients);
      await updateRawIngredients(editedValues);
      setIngredients((prev) =>
        prev.map((ing) => editedIngredients[ing.raw_ingredient_id] || ing)
      );
      setEditMode({});
      setEditedIngredients({});
      toaster.create({
        title: 'Éxito',
        description: 'Cambios guardados correctamente.',
        type: 'success',
        duration: 3000,
      });
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error al guardar los cambios.',
        type: 'error',
        duration: 3000,
      });
    }
  };

  const hasEdited = Object.keys(editedIngredients).length > 0;

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
              mb={{ base: 4, md: 6, lg: 8 }}
              fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
              color="gray.800"
              textAlign={{ base: 'center', md: 'left' }}
            >
              Ingredientes del Restaurante
            </Heading>
            <Box mb={{ base: 3, md: 4, lg: 6 }} width="100%">
              <Flex
                direction={{ base: 'column', sm: 'row' }}
                gap={{ base: 2, md: 3, lg: 4 }}
                align="center"
                justify="space-between"
              >
                <Box flex="1" width="100%">
                  <CustomField label="Filtrar por categoría">
                    <Select.Root
                      collection={categoryCollection}
                      value={selectedCategory}
                      onValueChange={(val) => setSelectedCategory(val.value)}
                      size={{ base: 'sm', md: 'md', lg: 'lg' }}
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
                  size={{ base: 'sm', md: 'md', lg: 'lg' }}
                  fontSize={{ base: 'sm', md: 'md' }}
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
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minH={{ base: '150px', md: '200px', lg: '250px' }}
              >
                <Spinner size={{ base: 'lg', md: 'xl', lg: '2xl' }} />
              </Box>
            ) : error ? (
              <Text 
                color="red.500"
                fontSize={{ base: 'sm', md: 'md' }}
                textAlign="center"
                p={{ base: 3, md: 4 }}
                bg="red.50"
                borderRadius={{ base: 'sm', md: 'md' }}
              >
                {error}
              </Text>
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
    </div>
  );
};

export default IngredientPage;
