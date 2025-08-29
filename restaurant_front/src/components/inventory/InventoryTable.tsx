import React from 'react';
import {
  Table,
  Text,
  Button,
  IconButton,
  Input,
  Box,
  Badge,
  Select as ChakraSelect,
  Stack,
  Icon,
} from '@chakra-ui/react';
import { MdDeleteForever } from 'react-icons/md';
import type { Inventory } from '../../interfaces/inventory';

interface InventoryTableProps {
  inventario: Inventory[];
  modoEdicion: { [id: string]: boolean };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  handleChange: (id: string, field: keyof Inventory, value: any) => void;
  isLoading: boolean;
}

const UNIDADES: Array<'g' | 'ml' | 'kg' | 'l' | 'un'> = ['g', 'ml', 'kg', 'l', 'un'];

export const InventoryTable: React.FC<InventoryTableProps> = ({
  inventario,
  modoEdicion,
  onEdit,
  onDelete,
  handleChange,
  isLoading,
}) => {
  if (isLoading) {
    return <Text>Cargando inventario...</Text>;
  }
  console.log(inventario);
  return (
    <Box overflowX="auto">
      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Nombre</Table.ColumnHeader>
            <Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>
              Categoría
            </Table.ColumnHeader>
            <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
            <Table.ColumnHeader display={{ base: 'none', md: 'table-cell' }}>
              Unidad
            </Table.ColumnHeader>
            <Table.ColumnHeader display={{ base: 'none', lg: 'table-cell' }}>
              Cantidad Mínima
            </Table.ColumnHeader>
            <Table.ColumnHeader>Precio</Table.ColumnHeader>
            <Table.ColumnHeader>Merma</Table.ColumnHeader>
            <Table.ColumnHeader display={{ base: 'none', lg: 'table-cell' }}>
              Última Reposición
            </Table.ColumnHeader>
            <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {inventario.map((item) => (
            <Table.Row key={item.id}>
              {modoEdicion[item.id] ? (
                <>
                  <Table.Cell>
                    <Text>{item.nombre}</Text>
                  </Table.Cell>
                  <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                    <Text>{item.categoria}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      min={0}
                      value={item.cantidad}
                      onChange={(e) =>
                        handleChange(item.id, 'cantidad', parseFloat(e.target.value) || 0)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                    <select
                      value={item.unidad}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        handleChange(item.id, 'unidad', e.target.value)
                      }
                      className="chakra-select"
                      style={{
                        width: '100%',
                        padding: '8px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: 'inherit',
                      }}
                    >
                      {UNIDADES.map((unidad) => (
                        <option key={unidad} value={unidad}>
                          {unidad}
                        </option>
                      ))}
                    </select>
                  </Table.Cell>
                  <Table.Cell display={{ base: 'none', lg: 'table-cell' }}>
                    <Input
                      type="number"
                      min={0}
                      value={item.cantidad_minima}
                      onChange={(e) =>
                        handleChange(item.id, 'cantidad_minima', parseFloat(e.target.value) || 0)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      min={0}
                      value={item.precio}
                      onChange={(e) =>
                        handleChange(item.id, 'precio', parseFloat(e.target.value) || 0)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{(item.merma * 100).toFixed(0)}%</Text>
                  </Table.Cell>
                  <Table.Cell display={{ base: 'none', lg: 'table-cell' }}>
                    <Text>
                      {item.ultima_reposicion
                        ? new Date(item.ultima_reposicion).toLocaleDateString()
                        : '-'}
                    </Text>
                  </Table.Cell>
                </>
              ) : (
                <>
                  <Table.Cell>
                    <Text>{item.nombre}</Text>
                  </Table.Cell>
                  <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                    <Text>{item.categoria}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{item.cantidad}</Text>
                  </Table.Cell>
                  <Table.Cell display={{ base: 'none', md: 'table-cell' }}>
                    <Text>{item.unidad}</Text>
                  </Table.Cell>
                  <Table.Cell display={{ base: 'none', lg: 'table-cell' }}>
                    <Text>{item.cantidad_minima}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>${item.precio.toFixed(2)}</Text>
                  </Table.Cell>
                  <Table.Cell>
                    <Text>{(item.merma * 100).toFixed(0)}%</Text>
                  </Table.Cell>
                  <Table.Cell display={{ base: 'none', lg: 'table-cell' }}>
                    <Text>
                      {item.ultima_reposicion
                        ? new Date(item.ultima_reposicion).toLocaleDateString()
                        : '-'}
                    </Text>
                  </Table.Cell>
                </>
              )}
              <Table.Cell>
                <Stack direction="row" gap={2} justify="center">
                  <Button size="sm" onClick={() => onEdit(item.id)}>
                    {modoEdicion[item.id] ? 'Guardar' : 'Editar'}
                  </Button>
                  <IconButton
                    aria-label="Eliminar alimento"
                    size="sm"
                    colorScheme="red"
                    onClick={() => onDelete(item.id)}
                  >
                    <Icon as={MdDeleteForever} />
                  </IconButton>
                </Stack>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};
