import React, { useEffect } from 'react';
import { Box, Text, Button, NativeSelect, Textarea } from '@chakra-ui/react';
import { StepperInput } from '../ui/stepper-input';
import { MenuItemResponse } from '../../interfaces/menuItems';
import { isWaiter } from '../../pages/utils/roleUtils';
import { useParams } from 'react-router-dom';
import { useTables } from '../../hooks/useTables';

interface CartItem {
  menu_item_id: string;
  name: string;
  price: number;
  quantity: number;
  observation: string;
  selectedSides?: string[];
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
  allMenuItems: MenuItemResponse[];
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
  allMenuItems,
}) => {
  const { restaurantId } = useParams();
  const { tables, fetchTables } = useTables(restaurantId);
  const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  useEffect(() => {
    fetchTables(); // Fetch tables on mount and when restaurantId changes
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
          {tables
            .filter((table) => table.status === 'available')
            .map((table) => (
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
        cart.map((item) => {
          // Get side dish names if present
          const sideDishes =
            item.selectedSides && item.selectedSides.length > 0
              ? item.selectedSides
                  .map((sideId: string) => {
                    const side = allMenuItems.find((mi) => mi.menu_item_id === sideId);
                    return side ? side.name : null;
                  })
                  .filter(Boolean)
              : [];

          return (
            <Box
              key={item.menu_item_id + (item.selectedSides ? item.selectedSides.join(',') : '')}
              display="flex"
              flexDirection="column"
              mb={2}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Text>
                  {item.quantity} - {item.name} - ${item.price * item.quantity} - {item.observation}
                </Text>
                {!orderPlaced && (
                  <Box display="flex" alignItems="center">
                    <StepperInput
                      key={item.menu_item_id}
                      name={item.menu_item_id}
                      value={item.quantity.toString()}
                      onValueChange={(e: { value: string }) =>
                        updateCartQuantity(item.menu_item_id, Number(e.value))
                      }
                    />
                  </Box>
                )}
              </Box>
              {/* Show side dishes if any */}
              {sideDishes.length > 0 && (
                <Text fontSize="sm" color="gray.600" ml={2}>
                  Guarniciones: {sideDishes.join(', ')}
                </Text>
              )}
            </Box>
          );
        })
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
