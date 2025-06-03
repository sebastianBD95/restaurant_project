import { Box, Text, Badge, Image, Flex } from '@chakra-ui/react';

interface VoidOrderItemCardProps {
  item: {
    menu_item_id: string;
    name: string;
    price: number;
    image?: string;
  };
}

const VoidOrderItemCard: React.FC<VoidOrderItemCardProps> = ({ item }) => (
  <Box borderWidth="1px" borderRadius="lg" p={4} mb={2} bg="white" boxShadow="md">
    <Flex align="center">
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
      <Box flex="1">
        <Text fontWeight="bold" fontSize="lg" mb={1}>{item.name}</Text>
        <Text color="gray.600" fontSize="md">Precio: ${item.price.toLocaleString()}</Text>
      </Box>
    </Flex>
  </Box>
);

export default VoidOrderItemCard; 