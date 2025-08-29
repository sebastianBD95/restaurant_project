'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  Input,
  Button,
  Select,
  Portal,
  createListCollection,
} from '@chakra-ui/react';
import { toast as sonner } from 'sonner';

export function useToast() {
  return sonner;
}

const metodoPagoItems = createListCollection({
  items: [
    { label: 'Efectivo', value: 'efectivo' },
    { label: 'Débito', value: 'debito' },
    { label: 'Crédito', value: 'credito' },
    { label: 'PSE', value: 'pse' },
  ],
});

const PaginaPagos: React.FC = () => {
  const [mesaSeleccionada, setMesaSeleccionada] = useState('');
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [facturacion, setFacturacion] = useState({ nombre: '', cedula: '', correo: '' });
  const toast = useToast();

  useEffect(() => {
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    setPedidos(storedOrders);
  }, []);

  const mesasEnProceso = [
    ...new Set(pedidos.filter((p) => p.status === 'Entregado a la mesa').map((p) => p.table)),
  ];

  const pedidosMesa = pedidos.filter((p) => p.table === mesaSeleccionada);
  const total = pedidosMesa.reduce(
    (acc, pedido) => acc + pedido.items.reduce((t: number, i: any) => t + i.price * i.quantity, 0),
    0
  );

  const handlePago = () => {
    if (!mesaSeleccionada || !facturacion.nombre || !facturacion.cedula || !facturacion.correo) {
      toast('Completa todos los campos requeridos.');
      return;
    }

    const restantes = pedidos.filter((p) => p.table !== mesaSeleccionada);
    const pagados = pedidosMesa.map((p) => ({ ...p, status: 'Pagado', paid: true }));

    const historial = JSON.parse(localStorage.getItem('history') || '[]');
    localStorage.setItem('history', JSON.stringify([...historial, ...pagados]));
    localStorage.setItem('orders', JSON.stringify(restantes));

    toast('Pago registrado con éxito. Gracias por tu pago.');

    setMesaSeleccionada('');
    setFacturacion({ nombre: '', cedula: '', correo: '' });
  };

  return (
    <Box p={6}>
      <Heading mb={4}>💳 Página de Pagos</Heading>

      <VStack align="start" mb={6}>
        <Text fontWeight="bold">Selecciona la mesa</Text>
        <Select.Root
          collection={createListCollection({
            items: mesasEnProceso.map((m) => ({ label: `Mesa ${m}`, value: m })),
          })}
          value={[mesaSeleccionada]}
          onValueChange={(val) => setMesaSeleccionada(val.value[0])}
          size="sm"
          width="240px"
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Selecciona una mesa" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {mesasEnProceso.map((mesa) => (
                  <Select.Item key={mesa} item={{ label: `Mesa ${mesa}`, value: mesa }}>
                    Mesa {mesa}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>

        <Text fontWeight="bold">Método de pago</Text>
        <Select.Root
          collection={metodoPagoItems}
          value={[metodoPago]}
          onValueChange={(val) => setMetodoPago(val.value[0])}
          size="sm"
          width="240px"
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText placeholder="Método de pago" />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Portal>
            <Select.Positioner>
              <Select.Content>
                {metodoPagoItems.items.map((item) => (
                  <Select.Item item={item} key={item.value}>
                    {item.label}
                    <Select.ItemIndicator />
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Positioner>
          </Portal>
        </Select.Root>

        <Text fontWeight="bold">Información para facturación electrónica</Text>
        <Input
          placeholder="Nombre completo"
          value={facturacion.nombre}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFacturacion({ ...facturacion, nombre: e.target.value })
          }
        />
        <Input
          placeholder="Número de cédula"
          value={facturacion.cedula}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFacturacion({ ...facturacion, cedula: e.target.value })
          }
        />
        <Input
          placeholder="Correo electrónico"
          value={facturacion.correo}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFacturacion({ ...facturacion, correo: e.target.value })
          }
        />
      </VStack>

      <Heading size="md" mb={2}>
        Resumen de Cuenta
      </Heading>
      {pedidosMesa.length === 0 ? (
        <Text>No hay pedidos registrados para esta mesa.</Text>
      ) : (
        <VStack align="start" mb={4}>
          {pedidosMesa.flatMap((pedido, i) =>
            pedido.items.map((item: any, j: number) => (
              <Text key={`${i}-${j}`}>
                {item.quantity}x {item.name} - ${item.price * item.quantity}
              </Text>
            ))
          )}
          <Text fontWeight="bold">Total a pagar: ${total.toFixed(2)}</Text>
        </VStack>
      )}

      <Button colorScheme="green" onClick={handlePago} disabled={pedidosMesa.length === 0}>
        Confirmar y Pagar
      </Button>
    </Box>
  );
};

export default PaginaPagos;
