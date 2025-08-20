import React, { useState } from 'react';
import { Box, Text, Button, Image, Flex } from '@chakra-ui/react';
import { DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter, DialogCloseTrigger } from '../ui/dialog';
import { CustomField } from '../ui/field';
import { VoidOrderItem } from '../../interfaces/order';

interface RecoverVoidItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  voidItem: VoidOrderItem | null;
  availableOrders: Array<{ order_id: string; table: number }>;
  onRecover: (voidOrderItemId: string, targetOrderId: string) => void;
}

const RecoverVoidItemDialog: React.FC<RecoverVoidItemDialogProps> = ({
  isOpen,
  onClose,
  voidItem,
  availableOrders,
  onRecover,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');

  const handleRecover = () => {
    if (selectedOrderId && voidItem) {
      onRecover(voidItem.void_order_item_id, selectedOrderId);
      onClose();
      setSelectedOrderId('');
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedOrderId('');
  };

  return (
    <DialogRoot open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent>
        <DialogHeader>Recuperar Plato Anulado</DialogHeader>
        <DialogCloseTrigger />
        <DialogBody>
          <Box display="flex" flexDirection="column" gap={4}>
            {voidItem && (
              <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
                <Flex align="center">
                  {voidItem.image && (
                    <Image
                      src={voidItem.image}
                      alt={voidItem.name}
                      boxSize="60px"
                      objectFit="cover"
                      borderRadius="md"
                      mr={4}
                    />
                  )}
                  <Box flex="1">
                    <Text fontWeight="bold" fontSize="lg">{voidItem.name}</Text>
                    <Text color="gray.600" fontSize="md">
                      Precio: ${voidItem.price.toLocaleString()}
                    </Text>
                    {voidItem.observation && (
                      <Text color="gray.500" fontSize="sm" fontStyle="italic">
                        Observación: {voidItem.observation}
                      </Text>
                    )}
                  </Box>
                </Flex>
              </Box>
            )}

            <CustomField label="Seleccionar Mesa para Recuperar" required>
              <select
                value={selectedOrderId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedOrderId(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  borderRadius: '4px', 
                  border: '1px solid #CBD5E0',
                  backgroundColor: 'white'
                }}
              >
                <option value="">Selecciona una mesa</option>
                {availableOrders.map((order) => (
                  <option key={order.order_id} value={order.order_id}>
                    Mesa {order.table}
                  </option>
                ))}
              </select>
            </CustomField>

            {availableOrders.length === 0 && (
              <Text color="red.500" fontSize="sm">
                No hay mesas activas disponibles para recuperar este plato.
              </Text>
            )}
          </Box>
        </DialogBody>

        <DialogFooter>
          <Button variant="ghost" mr={3} onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            colorScheme="green"
            onClick={handleRecover}
            disabled={!selectedOrderId || availableOrders.length === 0}
          >
            Recuperar
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default RecoverVoidItemDialog;
