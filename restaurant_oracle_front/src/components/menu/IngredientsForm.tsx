import React, { useState, useEffect } from 'react';
import { Stack, Input, Box, Button, Grid, GridItem, Spinner, Text, Select as ChakraSelect, Portal, createListCollection } from '@chakra-ui/react';
import { CustomField } from '../ui/field';
import { Ingredient } from '../../interfaces/ingredients';
import { getRawIngredientsByCategory } from '../../services/ingredientService';
import { getCookie } from '../../pages/utils/cookieManager';

const categories = [
  'Pollo', 'Fruta', 'Lácteo', 'Res', 'Cerdo', 'Condimento', 'Cereal', 'Pescado',
  'Grano', 'Harina', 'Hongo', 'Grasa', 'Legumbre', 'Verdura', 'Marisco'
];

interface IngredientsFormProps {
  ingredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
}

const IngredientsForm: React.FC<IngredientsFormProps> = ({
  ingredients,
  onIngredientsChange
}) => {
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>({
    raw_ingredient_id: '',
    name: '',
    quantity: 0,
    unit: 'g',
    price: 0
  });
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [ingredientOptions, setIngredientOptions] = useState<{ raw_ingredient_id: string; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [errors, setErrors] = useState({
    name: false,
    quantity: false,
    price: false
  });

  useEffect(() => {
    if (selectedCategory) {
      setLoadingOptions(true);
      setFetchError('');
      const token = getCookie(document.cookie, 'token') || '';
      getRawIngredientsByCategory(selectedCategory, token)
        .then((data) => {
          setIngredientOptions(data);
        })
        .catch(() => {
          setFetchError('Error al cargar ingredientes.');
          setIngredientOptions([]);
        })
        .finally(() => setLoadingOptions(false));
    } else {
      setIngredientOptions([]);
    }
    setCurrentIngredient((prev) => ({ ...prev, raw_ingredient_id: '', name: '' }));
  }, [selectedCategory]);

  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentIngredient(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) || 0 : value
    }));
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const handleIngredientSelectChange = (details: { value: string[] }) => {
    const selectedId = details.value && details.value.length > 0 ? details.value[0] : '';
    const selectedOption = ingredientOptions.find(opt => opt.raw_ingredient_id === selectedId);
    setCurrentIngredient(prev => ({
      ...prev,
      raw_ingredient_id: selectedId,
      name: selectedOption ? selectedOption.name : '',
    }));
    setErrors(prev => ({ ...prev, name: false }));
  };

  const ingredientCollection = createListCollection({
    items: ingredientOptions.map(opt => ({
      label: opt.name,
      value: opt.raw_ingredient_id,
      name: opt.name,
    })),
  });

  const validateIngredient = () => {
    const newErrors = {
      name: !currentIngredient.raw_ingredient_id,
      quantity: !currentIngredient.quantity || currentIngredient.quantity <= 0,
      price: !currentIngredient.price || currentIngredient.price <= 0
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(Boolean);
  };

  const addIngredient = () => {
    if (validateIngredient()) {
      const newIngredients = [...ingredients, currentIngredient];
      onIngredientsChange(newIngredients);
      setCurrentIngredient({
        raw_ingredient_id: '',
        name: '',
        quantity: 0,
        unit: 'g',
        price: 0
      });
      setErrors({ name: false, quantity: false, price: false });
    }
  };

  const removeIngredient = (index: number) => {
    const newIngredients = ingredients.filter((_, i) => i !== index);
    onIngredientsChange(newIngredients);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <Stack gap="4">
        <CustomField label="Categoría de ingrediente" required>
          <select
            style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
            value={selectedCategory}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </CustomField>
        <CustomField
          label="Ingrediente"
          required
          errorText={errors.name ? "Este campo es obligatorio." : undefined}
        >
          {loadingOptions ? (
            <Spinner size="sm" />
          ) : fetchError ? (
            <Text color="red.500">{fetchError}</Text>
          ) : (
            <ChakraSelect.Root
              value={currentIngredient.raw_ingredient_id ? [currentIngredient.raw_ingredient_id] : []}
              onValueChange={handleIngredientSelectChange}
              collection={ingredientCollection}
              disabled={!selectedCategory || ingredientOptions.length === 0}
              size="md"
              width="100%"
              multiple={false}
            >
              <ChakraSelect.HiddenSelect /> 
              <ChakraSelect.Control>
                <ChakraSelect.Trigger>
                  <ChakraSelect.ValueText placeholder={selectedCategory ? "Selecciona un ingrediente" : "Primero selecciona una categoría"} />
                </ChakraSelect.Trigger>
                <ChakraSelect.IndicatorGroup>
                  <ChakraSelect.Indicator />
                </ChakraSelect.IndicatorGroup>
              </ChakraSelect.Control>
                <ChakraSelect.Positioner>
                  <ChakraSelect.Content>
                    {ingredientCollection.items.map((item) => (
                      <ChakraSelect.Item item={item} key={item.value}>
                        {item.label}
                        <ChakraSelect.ItemIndicator />
                      </ChakraSelect.Item>
                    ))}
                  </ChakraSelect.Content>
                </ChakraSelect.Positioner>
            </ChakraSelect.Root>
          )}
        </CustomField>
        <Stack direction="row" gap="4">
          <CustomField
            label="Cantidad"
            required
            errorText={errors.quantity ? "La cantidad debe ser mayor a 0." : undefined}
          >
            <Input
              placeholder="Cantidad"
              value={currentIngredient.quantity}
              onChange={handleIngredientChange}
              name="quantity"
              type="number"
              min="0"
              step="0.01"
            />
          </CustomField>
          <CustomField
            label="Unidad"
            required
          >
            <select
              value={currentIngredient.unit}
              onChange={handleIngredientChange}
              name="unit"
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '6px',
                border: '1px solid #E2E8F0'
              }}
            >
              <option value="g">gramos (g)</option>
              <option value="kg">kilogramos (kg)</option>
              <option value="ml">mililitros (ml)</option>
              <option value="l">litros (l)</option>
              <option value="unidad">unidad</option>
              <option value="cucharada">cucharada</option>
              <option value="cucharadita">cucharadita</option>
              <option value="taza">taza</option>
            </select>
          </CustomField>
          <CustomField
            label="Precio"
            required
            errorText={errors.price ? "El precio debe ser mayor a 0." : undefined}
          >
            <Input
              placeholder="Precio"
              value={currentIngredient.price}
              onChange={handleIngredientChange}
              name="price"
              type="number"
              min="0"
              step="0.01"
            />
          </CustomField>
        </Stack>
        <Button onClick={addIngredient} colorScheme="blue" disabled={!selectedCategory}>
          Agregar Ingrediente
        </Button>

        {ingredients.length > 0 && (
          <Box mt={4}>
            <Box fontWeight="semibold" mb={2}>Ingredientes Agregados</Box>
            <Box borderWidth={1} borderRadius="md" overflow="hidden">
              <Grid templateColumns="2fr 1fr 1fr 1fr 1fr" gap={4} p={4} bg="gray.50" fontWeight="bold">
                <GridItem>Ingrediente</GridItem>
                <GridItem textAlign="right">Cantidad</GridItem>
                <GridItem>Unidad</GridItem>
                <GridItem textAlign="right">Precio</GridItem>
                <GridItem>Acciones</GridItem>
              </Grid>
              {ingredients.map((ingredient, index) => (
                <Grid
                  key={index}
                  templateColumns="2fr 1fr 1fr 1fr 1fr"
                  gap={4}
                  p={4}
                  borderTopWidth={1}
                  alignItems="center"
                >
                  <GridItem>{ingredient.name}</GridItem>
                  <GridItem textAlign="right">{ingredient.quantity}</GridItem>
                  <GridItem>{ingredient.unit}</GridItem>
                  <GridItem textAlign="right">${ingredient.price.toFixed(2)}</GridItem>
                  <GridItem>
                    <Button
                      size="sm"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => removeIngredient(index)}
                    >
                      Eliminar
                    </Button>
                  </GridItem>
                </Grid>
              ))}
            </Box>
          </Box>
        )}
      </Stack>
    </form>
  );
};

export default IngredientsForm; 