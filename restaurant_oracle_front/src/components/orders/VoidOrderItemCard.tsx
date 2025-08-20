import { Box, Text, Badge, Image, Flex, Button, VStack } from '@chakra-ui/react';
import { VoidOrderItem } from '../../interfaces/order';

interface VoidOrderItemCardProps {
  item: VoidOrderItem;
  onRecoverClick?: (voidItem: VoidOrderItem) => void;
  availableOrders?: Array<{ order_id: string; table: number }>;
}

const VoidOrderItemCard: React.FC<VoidOrderItemCardProps> = ({ item, onRecoverClick, availableOrders }) => (
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
          <Text fontWeight="bold" fontSize="lg">{item.name}</Text>
          <Text color="gray.600" fontSize="md">Precio: ${item.price.toLocaleString()}</Text>
          {item.observation && (
            <Text color="gray.500" fontSize="sm" fontStyle="italic">
              Observación: {item.observation}
            </Text>
          )}
        </VStack>
      </Flex>
      {onRecoverClick && availableOrders && availableOrders.length > 0 && (
        <Button
          colorScheme="green"
          size="sm"
          onClick={() => onRecoverClick(item)}
        >
          Recuperar
        </Button>
      )}
    </Flex>
  </Box>
);

export default VoidOrderItemCard; 