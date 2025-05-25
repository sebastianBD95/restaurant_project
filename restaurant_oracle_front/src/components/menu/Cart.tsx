import React, { useEffect, useState } from 'react';
import { Box, Text, Button, NativeSelect, Textarea } from '@chakra-ui/react';
import { StepperInput } from '../ui/stepper-input';
import { MenuItemResponse } from '../../interfaces/menuItems';
import { isWaiter } from '../../pages/utils/roleUtils';
import { getTables } from '../../services/tableService';
import { useParams } from 'react-router-dom';
import { Table } from '../../interfaces/table';
import { toaster } from '../ui/toaster';

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  observation: string;
}

interface CartProps {
  cart: CartItem[];
  orderPlaced: boolean;
  tableNumber: string;
  setTableNumber: (value: string) => void;
  observations: string;
  setObservations: (value: string) => void;
  updateCartQuantity: (id: string, newQuantity: number) => void;
  placeOrder: () => Promise<void>;
}

const Cart: React.FC<CartProps> = ({
  cart,
  orderPlaced,
  tableNumber,
  setTableNumber,
  observations,
  setObservations,
  updateCartQuantity,
  placeOrder,
}) => {
  const [tables, setTables] = useState<Table[]>([]);
  const { restaurantId } = useParams();
  const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const fetchedTables = await getTables(restaurantId!);
        setTables(fetchedTables.filter((table) => table.status === 'available'));
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: 'Error cargando mesas.',
          type: 'error',
          duration: 5000,
        });
      }
    };
    fetchTables();
  }, [restaurantId]);

  if (!isWaiter()) {
    return null;
  }


  return (
    <Box mt={6} p={4} bg="white" borderRadius="md" boxShadow="md">
      <Text fontSize="md" fontWeight="bold" mb={4}>
        Pedido
      </Text>

      <Text fontSize="md" fontWeight="bold" mb={2}>
        Número de Mesa
      </Text>
      <NativeSelect.Root size="sm" width="240px" mb={4}>
        <NativeSelect.Field
          placeholder="Selecciona una mesa"
          value={tableNumber}
          onChange={(e) => setTableNumber(e.target.value)}
        >
          {tables.map((table) => (
            <option key={table.table_id} value={table.table_id}>
              {table.table_number}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      <Text fontSize="md" fontWeight="bold" mb={2}>
        Observaciones
      </Text>
      <Textarea
        placeholder="Escribe alguna observación sobre tu pedido..."
        value={observations}
        onChange={(e) => setObservations(e.target.value)}
        mb={4}
      />

      {cart.length === 0 ? (
        <Text>No has agregado ningún plato.</Text>
      ) : (
        cart.map((item) => (
          <Box
            key={item.menu_item_id}
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Text>
              {item.quantity} - {item.name} - ${item.price * item.quantity} - {item.observation}
            </Text>
            {!orderPlaced && (
              <Box display="flex" alignItems="center">
                <StepperInput
                  key={item.menu_item_id}
                  name={item.menu_item_id}
                  value={item.quantity.toString()}
                  onValueChange={(e: { value: string }) => updateCartQuantity(item.menu_item_id, Number(e.value))}
                />
              </Box>
            )}
          </Box>
        ))
      )}

      <Text fontSize="lg" fontWeight="bold" mt={3}>
        Total: ${totalCost.toFixed(2)}
      </Text>
      <Button
        mt={4}
        colorScheme="green"
        width="full"
        onClick={placeOrder}
        disabled={cart.length === 0 || orderPlaced || !tableNumber}
      >
        Ordenar
      </Button>
    </Box>
  );
};

export default Cart; 