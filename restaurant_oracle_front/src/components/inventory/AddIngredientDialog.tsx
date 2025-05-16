import React from 'react';
import {
  Stack,
  Button,
  Text,
  Spinner,
  Box,
} from '@chakra-ui/react';
import {
  DialogRoot,
  DialogContent,
  DialogBody,
  DialogTitle,
} from '../ui/dialog';
import { Ingredient } from '../../services/ingredientService';

interface AddIngredientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  suggestedIngredients: Ingredient[];
  categoryIngredients: Ingredient[];
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
  onSelectIngredient: (ingredient: Ingredient) => void;
  loadingIngredients: boolean;
  fetchError: string;
  categories: string[];
}

export const AddIngredientDialog: React.FC<AddIngredientDialogProps> = ({
  isOpen,
  onClose,
  suggestedIngredients,
  categoryIngredients,
  selectedCategory,
  setSelectedCategory,
  onSelectIngredient,
  loadingIngredients,
  fetchError,
  categories,
}) => {
  const renderIngredientList = (ingredients: Ingredient[], isLoading: boolean, error?: string) => {
    if (isLoading) {
      return (
        <Box textAlign="center" py={4}>
          <Spinner />
        </Box>
      );
    }

    if (error) {
      return <Text color="red.500">{error}</Text>;
    }

    if (!ingredients.length) {
      return <Text>No hay ingredientes disponibles</Text>;
    }

    return (
      <Stack direction="column" gap={2}>
        {ingredients.map((ingredient) => (
          <Button
            key={ingredient.raw_ingredient_id}
            onClick={() => onSelectIngredient(ingredient)}
            variant="outline"
            justifyContent="flex-start"
            whiteSpace="normal"
            textAlign="left"
            height="auto"
            py={2}
          >
            {ingredient.name}
          </Button>
        ))}
      </Stack>
    );
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogTitle>Agregar Ingrediente</DialogTitle>
        <DialogBody>
          <Stack gap={4}>
            <Stack gap={2}>
              <Text fontWeight="bold">Ingredientes Sugeridos</Text>
              {renderIngredientList(suggestedIngredients, loadingIngredients, fetchError)}
            </Stack>
            <Stack gap={2}>
              <Text fontWeight="bold">Por Categoría</Text>
              <Stack gap={4}>
                <select
                  value={selectedCategory}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
                  className="chakra-select"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid',
                    borderColor: 'inherit',
                  }}
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                {renderIngredientList(categoryIngredients, loadingIngredients, fetchError)}
              </Stack>
            </Stack>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}; 