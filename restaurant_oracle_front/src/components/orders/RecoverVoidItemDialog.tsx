import React, { useState, useEffect } from 'react';
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
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    if (!voidItem?.created_at) return;

    const calculateTimeRemaining = () => {
      const createdAt = new Date(voidItem.created_at!).getTime();
      const now = new Date().getTime();
      const elapsedMinutes = Math.floor((now - createdAt) / 1000 / 60);
      const remaining = Math.max(0, 20 - elapsedMinutes);
      setTimeRemaining(remaining);
    };

    calculateTimeRemaining();
    const interval = setInterval(calculateTimeRemaining, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [voidItem?.created_at]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

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
                    <Text color={timeRemaining <= 5 ? "red.500" : "gray.400"} fontSize="sm" fontWeight="medium">
                      Tiempo restante: {formatTime(timeRemaining)}
                    </Text>
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
            disabled={!selectedOrderId || availableOrders.length === 0 || timeRemaining <= 0}
          >
            {timeRemaining <= 0 ? "Tiempo Expirado" : "Recuperar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default RecoverVoidItemDialog;
