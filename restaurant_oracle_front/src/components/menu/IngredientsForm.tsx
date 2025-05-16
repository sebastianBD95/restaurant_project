import React, { useState } from 'react';
import { Stack, Input, Box, Button, Grid, GridItem } from '@chakra-ui/react';
import { CustomField } from '../ui/field';
import { Ingredient } from '../../interfaces/ingredients';

interface IngredientsFormProps {
  ingredients: Ingredient[];
  onIngredientsChange: (ingredients: Ingredient[]) => void;
}

const IngredientsForm: React.FC<IngredientsFormProps> = ({
  ingredients,
  onIngredientsChange
}) => {
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient>({
    name: '',
    quantity: 0,
    unit: 'g',
    price: 0
  });
  const [errors, setErrors] = useState({
    name: false,
    quantity: false,
    price: false
  });

  const handleIngredientChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentIngredient(prev => ({
      ...prev,
      [name]: name === 'quantity' || name === 'price' ? Number(value) || 0 : value
    }));
    // Clear error when user starts typing
    setErrors(prev => ({ ...prev, [name]: false }));
  };

  const validateIngredient = () => {
    const newErrors = {
      name: !currentIngredient.name,
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
        <CustomField
          label="Ingrediente"
          required
          errorText={errors.name ? "Este campo es obligatorio." : undefined}
        >
          <Input
            placeholder="Nombre del ingrediente"
            value={currentIngredient.name}
            onChange={handleIngredientChange}
            name="name"
          />
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
        <Button onClick={addIngredient} colorScheme="blue">
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