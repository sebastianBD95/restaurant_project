'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, Input, IconButton, VStack, Table, Text } from '@chakra-ui/react';
import { IoAddCircleOutline } from 'react-icons/io5';
import { MdDeleteForever } from 'react-icons/md';

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

  useEffect(() => {
    const dataInventario = localStorage.getItem('inventarioAlimentos');
    if (dataInventario) {
      setInventario(JSON.parse(dataInventario));
    }

    const dataGuardados = localStorage.getItem('alimentosGuardados');
    if (dataGuardados) {
      setAlimentosGuardados(JSON.parse(dataGuardados));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('inventarioAlimentos', JSON.stringify(inventario));
  }, [inventario]);

  const agregarAlimento = () => {
    const existeVacio = inventario.some((item) => !item.nombre);
    if (existeVacio) {
      alert('Completa el alimento anterior antes de agregar uno nuevo.');
      return;
    }

    const nuevo: Alimento = {
      id: crypto.randomUUID(),
      nombre: '',
      cantidad: 0,
      unidad: '',
      costoUnitario: 0,
    };
    const actualizado = [...inventario, nuevo];
    setInventario(actualizado);
    localStorage.setItem('inventarioAlimentos', JSON.stringify(actualizado));
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
    <Box p={6}>
      <Heading mb={4}>🧂 Inventario de Alimentos</Heading>

      <VStack align="start" mb={4} spacing={4}>
        <Button leftIcon={<IoAddCircleOutline />} colorScheme="teal" onClick={agregarAlimento}>
          Agregar Alimento
        </Button>
        <Button colorScheme="blue" onClick={guardarAlimentos}>
          Guardar Alimentos
        </Button>
      </VStack>

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
                  icon={<MdDeleteForever />}
                  onClick={() => eliminarAlimento(item.id)}
                />
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
    </Box>
  );
};

export default Inventario;
