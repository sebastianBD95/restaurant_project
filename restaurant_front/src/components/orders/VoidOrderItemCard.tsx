import { Box, Text, Badge, Image, Flex, Button, VStack } from '@chakra-ui/react';
import { VoidOrderItem } from '../../interfaces/order';
import { useState, useEffect } from 'react';

interface VoidOrderItemCardProps {
  item: VoidOrderItem;
  onRecoverClick?: (voidItem: VoidOrderItem) => void;
  availableOrders?: Array<{ order_id: string; table: number }>;
}

const VoidOrderItemCard: React.FC<VoidOrderItemCardProps> = ({
  item,
  onRecoverClick,
  availableOrders,
}) => {
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [canRecover, setCanRecover] = useState<boolean>(true);

  useEffect(() => {
    if (!item.created_at) {
      return;
    }

    const calculateTimeElapsed = () => {
      // The timestamp is now properly saved in UTC
      // Remove microseconds for proper parsing, keep Z for UTC
      const cleanTimestamp = item.created_at!.split('.')[0] + 'Z';
      const createdAt = new Date(cleanTimestamp).getTime();

      // Get current time in UTC milliseconds
      const now = new Date();
      const nowUTC = now.toISOString();
      const nowTime = new Date(nowUTC).getTime();

      if (isNaN(createdAt)) {
        console.error('Invalid date:', item.created_at);
        return;
      }

      const elapsed = Math.floor((nowTime - createdAt) / 1000 / 60); // Convert to minutes
      setTimeElapsed(Math.max(0, elapsed));
      setCanRecover(elapsed < 20); // 20 minutes limit
    };

    // Calculate immediately
    calculateTimeElapsed();

    // Update every 10 seconds for more responsive UI (you can change back to 60000 for production)
    const interval = setInterval(calculateTimeElapsed, 10000);

    return () => clearInterval(interval);
  }, [item.created_at]);

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} mb={2} bg="white" boxShadow="md">
      <Flex align="center" justify="space-between">
        <Flex align="center" flex="1">
          {item.image && (
            <Image
              src={item.image}
              alt={item.name}
              boxSize="60px"
              objectFit="cover"
              borderRadius="md"
              mr={4}
            />
          )}
          <VStack align="start" gap={1} flex="1">
            <Text fontWeight="bold" fontSize="lg">
              {item.name}
            </Text>
            <Text color="gray.600" fontSize="md">
              Precio: ${item.price.toLocaleString()}
            </Text>
            {item.observation && (
              <Text color="gray.500" fontSize="sm" fontStyle="italic">
                Observación: {item.observation}
              </Text>
            )}
            <Text color="gray.400" fontSize="xs">
              Tiempo: {formatTime(timeElapsed)}
            </Text>
          </VStack>
        </Flex>
        {onRecoverClick && availableOrders && availableOrders.length > 0 && (
          <Button
            colorScheme={canRecover ? 'green' : 'red'}
            size="sm"
            onClick={() => onRecoverClick(item)}
            disabled={!canRecover}
          >
            {canRecover ? 'Recuperar' : 'Cancelar'}
          </Button>
        )}
      </Flex>
    </Box>
  );
};

export default VoidOrderItemCard;
