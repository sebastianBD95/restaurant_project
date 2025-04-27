'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, Input, Button, Text, Table, VStack } from '@chakra-ui/react';

const PaginaReceta: React.FC = () => {
  const [inventario, setInventario] = useState<Alimento[]>([]);
  const [recetasGuardadas, setRecetasGuardadas] = useState<PlatoReceta[]>([]);
  const [modoEdicion, setModoEdicion] = useState<Record<string, boolean>>({});

  const todosLosPlatos = Object.values(menuData).flat();

  useEffect(() => {
    const data = localStorage.getItem('alimentosGuardados');
    if (data) setInventario(JSON.parse(data));

    const recetas = localStorage.getItem('recetasPlatos');
    if (recetas) {
      const guardadas: PlatoReceta[] = JSON.parse(recetas);
      const nombresExistentes = guardadas.map((r) => r.nombre);
      const faltantes = todosLosPlatos.filter((p) => !nombresExistentes.includes(p.name));
      const nuevas: PlatoReceta[] = faltantes.map((p) => ({ nombre: p.name, ingredientes: [] }));
      const completas = [...guardadas, ...nuevas];
      setRecetasGuardadas(completas);
      localStorage.setItem('recetasPlatos', JSON.stringify(completas));
      const edicionInicial = Object.fromEntries(completas.map((r) => [r.nombre, false]));
      setModoEdicion(edicionInicial);
    } else {
      const inicial = todosLosPlatos.map((p) => ({ nombre: p.name, ingredientes: [] }));
      setRecetasGuardadas(inicial);
      localStorage.setItem('recetasPlatos', JSON.stringify(inicial));
      const edicionInicial = Object.fromEntries(inicial.map((r) => [r.nombre, false]));
      setModoEdicion(edicionInicial);
    }
  }, []);

  const guardarEnLocalStorage = (nuevasRecetas: PlatoReceta[]) => {
    localStorage.setItem('recetasPlatos', JSON.stringify(nuevasRecetas));
  };

  const handleIngredienteChange = (plato: string, alimentoId: string, cantidad: number) => {
    const actualizadas = recetasGuardadas.map((r) => {
      if (r.nombre !== plato) return r;
      const otros = r.ingredientes.filter((ing) => ing.alimentoId !== alimentoId);
      return {
        ...r,
        ingredientes: [...otros, { alimentoId, cantidad }],
      };
    });
    setRecetasGuardadas(actualizadas);
    guardarEnLocalStorage(actualizadas);
  };

  const toggleEdicion = (plato: string) => {
    const updatedModo = { ...modoEdicion, [plato]: !modoEdicion[plato] };
    setModoEdicion(updatedModo);
    guardarEnLocalStorage(recetasGuardadas);
  };

  const calcularCostoPlato = (plato: PlatoReceta) => {
    return plato.ingredientes.reduce((total, ing) => {
      const alimento = inventario.find((a) => a.id === ing.alimentoId);
      const costoUnitario = alimento?.costoUnitario || 0;
      return total + ing.cantidad * costoUnitario;
    }, 0);
  };

  const resetearRecetas = () => {
    const reiniciadas = todosLosPlatos.map((p) => ({ nombre: p.name, ingredientes: [] }));
    setRecetasGuardadas(reiniciadas);
    guardarEnLocalStorage(reiniciadas);
  };

  return (
    <Box p={6}>
      <Heading mb={4}>🍽️ Recetas por Plato</Heading>

      <VStack align="start" mb={4}>
        <Button colorScheme="red" onClick={resetearRecetas}>
          Reiniciar Recetas
        </Button>
      </VStack>

      <Table.Root size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Plato</Table.ColumnHeader>
            <Table.ColumnHeader>Ingredientes</Table.ColumnHeader>
            <Table.ColumnHeader>Costo</Table.ColumnHeader>
            <Table.ColumnHeader textAlign="end">Acciones</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {recetasGuardadas.map((plato) => (
            <Table.Row key={plato.nombre}>
              <Table.Cell>{plato.nombre}</Table.Cell>
              <Table.Cell>
                <Table.Root size="xs">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Ingrediente</Table.ColumnHeader>
                      <Table.ColumnHeader>Unidad</Table.ColumnHeader>
                      <Table.ColumnHeader>Cantidad</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {inventario.map((alimento) => {
                      const uso =
                        plato.ingredientes.find((i) => i.alimentoId === alimento.id)?.cantidad || 0;
                      return (
                        <Table.Row key={alimento.id}>
                          <Table.Cell>{alimento.nombre}</Table.Cell>
                          <Table.Cell>{alimento.unidad}</Table.Cell>
                          <Table.Cell>
                            {modoEdicion[plato.nombre] ? (
                              <Input
                                type="number"
                                size="xs"
                                width="70px"
                                min={0}
                                value={uso}
                                onChange={(e) =>
                                  handleIngredienteChange(
                                    plato.nombre,
                                    alimento.id,
                                    parseInt(e.target.value, 10) || 0
                                  )
                                }
                              />
                            ) : (
                              <Text>{uso}</Text>
                            )}
                          </Table.Cell>
                        </Table.Row>
                      );
                    })}
                  </Table.Body>
                </Table.Root>
              </Table.Cell>
              <Table.Cell>
                <Text fontWeight="bold">${calcularCostoPlato(plato).toFixed(2)}</Text>
              </Table.Cell>
              <Table.Cell textAlign="end">
                <Button size="sm" onClick={() => toggleEdicion(plato.nombre)}>
                  {modoEdicion[plato.nombre] ? 'Guardar' : 'Editar'}
                </Button>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

interface Alimento {
  id: string;
  nombre: string;
  cantidad: number;
  unidad: string;
  costoUnitario?: number;
}

interface IngredienteRequerido {
  alimentoId: string;
  cantidad: number;
}

interface PlatoReceta {
  nombre: string;
  ingredientes: IngredienteRequerido[];
}

const menuData = {
  entrada: [
    { id: 1, name: 'Bruschetta' },
    { id: 2, name: 'Ensalada César' },
  ],
  platoFuerte: [
    { id: 3, name: 'Bife de Chorizo' },
    { id: 4, name: 'Pasta Alfredo' },
  ],
  postres: [
    { id: 5, name: 'Tiramisú' },
    { id: 6, name: 'Cheesecake' },
  ],
  bebidas: [
    { id: 7, name: 'Jugo de Naranja' },
    { id: 8, name: 'Café Espresso' },
  ],
};

export default PaginaReceta;
