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
  HStack,
  Spacer,
} from '@chakra-ui/react';
import { toast as sonner } from 'sonner';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
    <div className="page-wrapper">
      <Box p={{ base: 4, md: 6, lg: 8 }}>
        <HStack mb={{ base: 3, md: 4, lg: 6 }} flexDir={{ base: 'column', sm: 'row' }} alignItems={{ base: 'stretch', sm: 'center' }}>
          <Heading 
            size={{ base: 'lg', md: 'xl', lg: '2xl' }}
            textAlign={{ base: 'center', sm: 'left' }}
          >
            💳 Página de Pagos
          </Heading>
          <Spacer />
          <Button
            colorScheme="blue"
            variant="outline"
            onClick={() => navigate('/historial-pagos')}
            size={{ base: 'sm', md: 'md' }}
            width={{ base: 'full', sm: 'auto' }}
            fontSize={{ base: 'sm', md: 'md' }}
          >
            📊 Ver Historial de Pagos
          </Button>
        </HStack>

        <VStack align="start" mb={{ base: 4, md: 6, lg: 8 }} spacing={{ base: 3, md: 4, lg: 5 }}>
          <Text 
            fontWeight="bold" 
            fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
          >
            Selecciona la mesa
          </Text>
          <Select.Root
            collection={createListCollection({
              items: mesasEnProceso.map((m) => ({ label: `Mesa ${m}`, value: m })),
            })}
            value={[mesaSeleccionada]}
            onValueChange={(val) => setMesaSeleccionada(val.value[0])}
            size={{ base: 'sm', md: 'md' }}
            width={{ base: '100%', sm: '240px' }}
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

          <Text 
            fontWeight="bold" 
            fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
          >
            Método de pago
          </Text>
          <Select.Root
            collection={metodoPagoItems}
            value={[metodoPago]}
            onValueChange={(val) => setMetodoPago(val.value[0])}
            size={{ base: 'sm', md: 'md' }}
            width={{ base: '100%', sm: '240px' }}
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

          <Text 
            fontWeight="bold" 
            fontSize={{ base: 'sm', md: 'md', lg: 'lg' }}
          >
            Información para facturación electrónica
          </Text>
          <Input
            placeholder="Nombre completo"
            value={facturacion.nombre}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFacturacion({ ...facturacion, nombre: e.target.value })
            }
            size={{ base: 'md', lg: 'lg' }}
            fontSize={{ base: 'sm', md: 'md' }}
          />
          <Input
            placeholder="Número de cédula"
            value={facturacion.cedula}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFacturacion({ ...facturacion, cedula: e.target.value })
            }
            size={{ base: 'md', lg: 'lg' }}
            fontSize={{ base: 'sm', md: 'md' }}
          />
          <Input
            placeholder="Correo electrónico"
            value={facturacion.correo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFacturacion({ ...facturacion, correo: e.target.value })
            }
            size={{ base: 'md', lg: 'lg' }}
            fontSize={{ base: 'sm', md: 'md' }}
          />
        </VStack>

        <Heading 
          size={{ base: 'sm', md: 'md', lg: 'lg' }} 
          mb={{ base: 2, md: 3, lg: 4 }}
        >
          Resumen de Cuenta
        </Heading>
        {pedidosMesa.length === 0 ? (
          <Text fontSize={{ base: 'sm', md: 'md' }}>
            No hay pedidos registrados para esta mesa.
          </Text>
        ) : (
          <VStack align="start" mb={{ base: 3, md: 4, lg: 6 }} spacing={{ base: 2, md: 3 }}>
            {pedidosMesa.flatMap((pedido, i) =>
              pedido.items.map((item: any, j: number) => (
                <Text 
                  key={`${i}-${j}`}
                  fontSize={{ base: 'sm', md: 'md' }}
                >
                  {item.quantity}x {item.name} - ${item.price * item.quantity}
                </Text>
              ))
            )}
            <Text 
              fontWeight="bold" 
              fontSize={{ base: 'md', md: 'lg', lg: 'xl' }}
            >
              Total a pagar: ${total.toFixed(2)}
            </Text>
          </VStack>
        )}

        <Button 
          colorScheme="green" 
          onClick={handlePago} 
          disabled={pedidosMesa.length === 0}
          size={{ base: 'md', md: 'lg' }}
          fontSize={{ base: 'sm', md: 'md' }}
          py={{ base: 2, md: 3 }}
          width={{ base: 'full', sm: 'auto' }}
        >
          Confirmar y Pagar
        </Button>
      </Box>
    </div>
  );
};

export default PaginaPagos;
