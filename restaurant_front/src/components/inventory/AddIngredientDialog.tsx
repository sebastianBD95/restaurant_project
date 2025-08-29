import React, { useState } from 'react';
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
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 6;

  React.useEffect(() => {
    setCurrentPage(1); // Reset page when category changes
  }, [selectedCategory, loadingIngredients]);

  React.useEffect(() => {
    setCurrentPage(1); // Reset page when search changes
  }, [search]);

  // Always show search input, and allow searching all ingredients if no category is selected
  const allIngredients = suggestedIngredients.concat(categoryIngredients.filter(i => !suggestedIngredients.some(j => j.raw_ingredient_id === i.raw_ingredient_id)));
  const ingredientsToSearch = selectedCategory === '' ? allIngredients : categoryIngredients;

  const filteredIngredients = ingredientsToSearch.filter(ingredient =>
    ingredient.name.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedIngredients = filteredIngredients.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(filteredIngredients.length / pageSize);

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
              <Text fontWeight="bold">Por Categoría</Text>
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
                  marginBottom: '8px',
                }}
              >
                <option value="">Seleccionar categoría</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Buscar ingrediente..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  marginBottom: '12px',
                  padding: '8px',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E0',
                }}
              />
              <Box
                border="1px solid #E2E8F0"
                borderRadius="md"
                p={3}
                minH="60px"
                bg="gray.50"
              >
                {/* Show filtered and paginated ingredients regardless of category selection */}
                {filteredIngredients.length === 0 ? (
                  <Text color="gray.400">
                    {search ? 'No se encontraron ingredientes.' : 'No hay ingredientes disponibles.'}
                  </Text>
                ) : (
                  <>
                    {renderIngredientList(paginatedIngredients, loadingIngredients, fetchError)}
                    {filteredIngredients.length > pageSize && (
                      <Stack direction="row" justify="center" align="center" mt={3} gap={2}>
                        <Button
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={currentPage === 1}
                        >
                          Anterior
                        </Button>
                        <Text fontSize="sm" color="gray.600">
                          Página {currentPage} de {totalPages}
                        </Text>
                        <Button
                          size="sm"
                          onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                          disabled={currentPage === totalPages}
                        >
                          Siguiente
                        </Button>
                      </Stack>
                    )}
                  </>
                )}
              </Box>
            </Stack>
          </Stack>
        </DialogBody>
      </DialogContent>
    </DialogRoot>
  );
}; 