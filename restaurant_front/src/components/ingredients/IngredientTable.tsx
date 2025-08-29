import React, { useState } from 'react';
import { Table, Text, Button, IconButton, Input, Box, Stack } from '@chakra-ui/react';
import { FiTrash2 } from 'react-icons/fi';

interface IngredientRow {
  raw_ingredient_id: string;
  name: string;
  category: string;
  merma?: number;
}

interface IngredientTableProps {
  ingredients: IngredientRow[];
  editMode: { [id: string]: boolean };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  handleChange: (id: string, field: keyof IngredientRow, value: any) => void;
  isLoading: boolean;
  handleBulkSave: () => void;
  hasEdited: boolean;
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

const CATEGORY_OPTIONS = CATEGORIES.map((cat) => (
  <option key={cat} value={cat}>
    {cat}
  </option>
));

export const IngredientTable: React.FC<IngredientTableProps> = ({
  ingredients,
  editMode,
  onEdit,
  onDelete,
  handleChange,
  isLoading,
  handleBulkSave,
  hasEdited,
}) => {
  const [page, setPage] = useState(0);
  const pageSize = 25;
  const pageCount = Math.ceil(ingredients.length / pageSize);

  if (isLoading) {
    return <Text>Cargando ingredientes...</Text>;
  }

  // Pagination logic
  const start = page * pageSize;
  const end = start + pageSize;
  const visibleIngredients = ingredients.slice(start, end);

  return (
    <Box overflowX="auto">
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Nombre</Table.ColumnHeader>
            <Table.ColumnHeader>Categoría</Table.ColumnHeader>
            <Table.ColumnHeader>Merma</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {visibleIngredients.map((ingredient) => (
            <Table.Row key={ingredient.raw_ingredient_id}>
              {editMode[ingredient.raw_ingredient_id] ? (
                <>
                  <Table.Cell>
                    <Input
                      size="sm"
                      value={ingredient.name}
                      onChange={(e) =>
                        handleChange(ingredient.raw_ingredient_id, 'name', e.target.value)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <select
                      style={{
                        width: '100%',
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                      }}
                      value={ingredient.category}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleChange(ingredient.raw_ingredient_id, 'category', e.target.value)
                      }
                    >
                      {CATEGORY_OPTIONS}
                    </select>
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      size="sm"
                      type="number"
                      min={0}
                      max={1}
                      step={0.01}
                      value={ingredient.merma ?? ''}
                      onChange={(e) =>
                        handleChange(
                          ingredient.raw_ingredient_id,
                          'merma',
                          parseFloat(e.target.value)
                        )
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Stack direction="row" gap={2} justify="center">
                      <Button size="sm" onClick={() => onEdit(ingredient.raw_ingredient_id)}>
                        {editMode[ingredient.raw_ingredient_id] ? 'Guardar' : 'Editar'}
                      </Button>
                      <IconButton
                        aria-label="Eliminar"
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => onDelete(ingredient.raw_ingredient_id)}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Stack>
                  </Table.Cell>
                </>
              ) : (
                <>
                  <Table.Cell>
                    <Text>{ingredient.name}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{ingredient.category}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>
                      {ingredient.merma !== undefined
                        ? `${(ingredient.merma * 100).toFixed(0)}%`
                        : '-'}
                    </Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Stack direction="row" gap={2} justify="center">
                      <Button size="sm" onClick={() => onEdit(ingredient.raw_ingredient_id)}>
                        {editMode[ingredient.raw_ingredient_id] ? 'Guardar' : 'Editar'}
                      </Button>
                      <IconButton
                        aria-label="Eliminar"
                        size="sm"
                        colorScheme="red"
                        variant="outline"
                        onClick={() => onDelete(ingredient.raw_ingredient_id)}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </Stack>
                  </Table.Cell>
                </>
              )}
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
      {/* Pagination controls */}
      <Box display="flex" justifyContent="center" alignItems="center" mt={4} gap={2}>
        <Button size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>
          Anterior
        </Button>
        <Text>
          Página {page + 1} de {pageCount}
        </Text>
        <Button
          size="sm"
          onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
          disabled={page >= pageCount - 1}
        >
          Siguiente
        </Button>
      </Box>
      <Box display="flex" justifyContent="center" mt={4}>
        <Button colorScheme="green" onClick={handleBulkSave} disabled={!hasEdited}>
          Guardar cambios
        </Button>
      </Box>
    </Box>
  );
};
