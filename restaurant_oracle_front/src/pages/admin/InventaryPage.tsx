'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, Input, IconButton, VStack, Table, Text, Dialog, Portal, Stack, Badge, Flex } from '@chakra-ui/react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdDeleteForever } from 'react-icons/md';
import { getIngredients, Ingredient } from '../../services/ingredientService';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';

interface Alimento {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  costoUnitario?: number;
}

const Inventario: React.FC = () => {
  const [inventario, setInventario] = useState<Alimento[]>([]);
  const [alimentosGuardados, setAlimentosGuardados] = useState<Alimento[]>([]);
  const [modoEdicion, setModoEdicion] = useState<{ [id: string]: boolean }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [suggestedIngredients, setSuggestedIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const { restaurantId } = useParams();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  useEffect(() => {
    const dataGuardados = localStorage.getItem('alimentosGuardados');
    if (dataGuardados) {
      setAlimentosGuardados(JSON.parse(dataGuardados));
    }
  }, []);

  const fetchSuggestedIngredients = async () => {
    try {
      setLoading(true);
      const ingredients = await getIngredients(restaurantId!);
      setSuggestedIngredients(ingredients);
    } catch (error) {
      console.error('Error al obtener ingredientes sugeridos:', error);
    } finally {
      setLoading(false);
    }
  };

  const agregarAlimento = async () => {
    await fetchSuggestedIngredients();
    setIsDialogOpen(true);
  };

  const seleccionarIngrediente = (ingredient: Ingredient) => {
    const nuevo: Alimento = {
      id: crypto.randomUUID(),
      nombre: ingredient.name,
      cantidad: ingredient.amount,
      unidad: ingredient.unit,
      costoUnitario: ingredient.price,
    };
    setInventario(prev => [...prev, nuevo]);
    setIsDialogOpen(false);
  };

  const guardarAlimentos = () => {
    const fusionados: Alimento[] = [...alimentosGuardados];

    inventario.forEach((nuevo) => {
      const index = fusionados.findIndex(
        (a) => a.nombre.toLowerCase() === nuevo.nombre.toLowerCase()
      );
      if (index === -1) {
        fusionados.push(nuevo);
      } else {
        fusionados[index].cantidad += nuevo.cantidad;
        fusionados[index].unidad = nuevo.unidad;
        fusionados[index].costoUnitario = nuevo.costoUnitario;
      }
    });

    setAlimentosGuardados(fusionados);
    localStorage.setItem('alimentosGuardados', JSON.stringify(fusionados));
  };

  const eliminarAlimento = (id: string) => {
    setInventario((prev) => prev.filter((item) => item.id !== id));
  };

  const handleChange = (id: string, field: keyof Alimento, value: string | number) => {
    setInventario((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const handleChangeGuardado = (id: string, field: keyof Alimento, value: string | number) => {
    const actualizados = alimentosGuardados.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    setAlimentosGuardados(actualizados);
    localStorage.setItem('alimentosGuardados', JSON.stringify(actualizados));
  };

  const toggleEditar = (id: string) => {
    setModoEdicion((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <Flex height="100vh" direction={{ base: "column", md: "row" }}>
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        restaurantId={restaurantId}
      />
      <Box flex={1} p={{ base: 2, md: 6 }} overflowY="auto">
        <Box p={{ base: 4, md: 8 }} bg="gray.100" minH="100vh">
          <Heading mb={4}>🧂 Inventario de Alimentos</Heading>

          <Flex align="center" mb={4} gap={4}>
            <Button display="flex" alignItems="center" gap={2} colorScheme="teal" onClick={agregarAlimento}>
              <IoAddCircleOutline />
              Agregar Alimento
            </Button>
            <Button colorScheme="blue" onClick={guardarAlimentos}>
              Guardar Alimentos
            </Button>
          </Flex>

          <Table.Root size="sm">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
                <Table.ColumnHeader>Unidad</Table.ColumnHeader>
                <Table.ColumnHeader>Costo Unitario</Table.ColumnHeader>
                <Table.ColumnHeader textAlign="center">Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {inventario.map((item) => (
                <Table.Row key={item.id}>
                  <Table.Cell>
                    <Input
                      value={item.nombre}
                      onChange={(e) => handleChange(item.id, 'nombre', e.target.value)}
                      placeholder="Nombre del alimento"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      min={0}
                      value={item.cantidad}
                      onChange={(e) =>
                        handleChange(item.id, 'cantidad', parseInt(e.target.value, 10) || 0)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      value={item.unidad}
                      onChange={(e) => handleChange(item.id, 'unidad', e.target.value)}
                      placeholder="Ej: gramos, unidades, litros"
                    />
                  </Table.Cell>
                  <Table.Cell>
                    <Input
                      type="number"
                      min={0}
                      value={item.costoUnitario || 0}
                      onChange={(e) =>
                        handleChange(item.id, 'costoUnitario', parseFloat(e.target.value) || 0)
                      }
                    />
                  </Table.Cell>
                  <Table.Cell textAlign="center">
                    <IconButton
                      aria-label="Eliminar alimento"
                      size="sm"
                      colorScheme="red"
                      onClick={() => eliminarAlimento(item.id)}
                    >
                      <MdDeleteForever />
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>

          {alimentosGuardados.length > 0 && (
            <Box mt={10}>
              <Heading size="md" mb={4}>
                📦 Alimentos Guardados
              </Heading>
              <Table.Root size="sm">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                    <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
                    <Table.ColumnHeader>Unidad</Table.ColumnHeader>
                    <Table.ColumnHeader>Costo Unitario</Table.ColumnHeader>
                    <Table.ColumnHeader>Costo Total</Table.ColumnHeader>
                    <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {alimentosGuardados.map((item) => (
                    <Table.Row key={item.id}>
                      {modoEdicion[item.id] ? (
                        <>
                          <Table.Cell>
                            <Input
                              value={item.nombre}
                              onChange={(e) => handleChangeGuardado(item.id, 'nombre', e.target.value)}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Input
                              type="number"
                              min={0}
                              value={item.cantidad}
                              onChange={(e) =>
                                handleChangeGuardado(
                                  item.id,
                                  'cantidad',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Input
                              value={item.unidad}
                              onChange={(e) => handleChangeGuardado(item.id, 'unidad', e.target.value)}
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Input
                              type="number"
                              min={0}
                              value={item.costoUnitario || 0}
                              onChange={(e) =>
                                handleChangeGuardado(
                                  item.id,
                                  'costoUnitario',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </Table.Cell>
                          <Table.Cell>
                            <Text>${(item.cantidad * (item.costoUnitario || 0)).toFixed(2)}</Text>
                          </Table.Cell>
                        </>
                      ) : (
                        <>
                          <Table.Cell>
                            <Text>{item.nombre}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{item.cantidad}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>{item.unidad}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>${item.costoUnitario?.toFixed(2) || 0}</Text>
                          </Table.Cell>
                          <Table.Cell>
                            <Text>${(item.cantidad * (item.costoUnitario || 0)).toFixed(2)}</Text>
                          </Table.Cell>
                        </>
                      )}
                      <Table.Cell>
                        <Button size="sm" onClick={() => toggleEditar(item.id)}>
                          {modoEdicion[item.id] ? 'Guardar' : 'Editar'}
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            </Box>
          )}

          <Dialog.Root open={isDialogOpen} onOpenChange={(details) => setIsDialogOpen(details.open)}>
            <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content>
                  <Dialog.Header>
                    <Dialog.Title>Ingredientes Sugeridos</Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body pb="4">
                    {loading ? (
                      <Text>Cargando ingredientes...</Text>
                    ) : (
                      <Stack gap={4}>
                        {suggestedIngredients.map((ingredient, index) => (
                          <Box
                            key={index}
                            p={4}
                            borderWidth="1px"
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ bg: 'gray.50' }}
                            onClick={() => seleccionarIngrediente(ingredient)}
                          >
                            <Flex justify="space-between" align="center">
                              <Box>
                                <Text fontWeight="bold">{ingredient.name}</Text>
                                <Text color="gray.600">
                                  Cantidad sugerida: {ingredient.amount} {ingredient.unit}
                                </Text>
                              </Box>
                              <Badge colorScheme="green" fontSize="md">
                                ${ingredient.price.toFixed(2)}
                              </Badge>
                            </Flex>
                          </Box>
                        ))}
                      </Stack>
                    )}
                  </Dialog.Body>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
          </Dialog.Root>
        </Box>
      </Box>
    </Flex>
  );
};

export default Inventario;
