import React from 'react';
// import styles from '../../pages/styles/OrderCard.css';
import { Button, Heading, Text, Box, Flex, Badge, Stack } from '@chakra-ui/react';
import { Order } from '../../interfaces/order'; // Create this if it doesn't exist
import { OrderItem } from '../../interfaces/order'; // Create this if it doesn't exist

const statusMap: Record<string, string> = {
  'ordered': 'Pedido',
  'delivered': 'Entregado a la mesa',
  'paid': 'Pagado',
  'canceled': 'Cancelado'
};

interface OrderCardProps {
  order: Order;
  onDeliver: (orderId: string) => void;
  onPay: (orderId: string) => void;
  highlight?: boolean;
  onVoidItem?: (orderId: string, menuItemId: string) => void;
  onCancelItem?: (orderId: string, menuItemId: string) => void;
  onAddDishes?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onDeliver,
  onPay,
  highlight,
  onVoidItem,
  onCancelItem,
  onAddDishes
}) => (
  <Box
    bg={highlight ? 'yellow.50' : 'white'}
    border="1px solid"
    borderColor={highlight ? 'yellow.200' : 'gray.200'}
    borderRadius="lg"
    boxShadow="sm"
    p={5}
    mb={6}
    transition="box-shadow 0.2s"
    _hover={{ boxShadow: 'md' }}
  >
    <Flex justify="space-between" align="center" mb={2}>
      <Heading size="md" fontWeight="bold">
        Mesa {order.table}
      </Heading>
      <Badge colorScheme="purple" fontSize="1em" px={3} py={1} borderRadius="md">
        {statusMap[order.status] || order.status}
      </Badge>
    </Flex>
    <Text fontSize="sm" color="gray.500" mb={2}>
      Total: <b>${order.total_price}</b>
    </Text>
    <Box borderBottom="1px solid #E2E8F0" mb={3} />
    <Box mb={3}>
      {order.items.map((item, idx) => (
        <Flex key={idx} align="center" mb={1}>
          <Text flex={1}>
            <b>{item.quantity}x {item.name}</b> <span style={{ color: '#718096' }}>- ${item.price * item.quantity}</span>
            {item.observation && (
              <Text as="span" color="gray.500" fontSize="sm"> - {item.observation}</Text>
            )}
          </Text>
          {item.status === 'canceled' && (
            <Badge colorScheme="red" ml={2}>Cancelado</Badge>
          )}
          {item.status === 'void' && (
            <Badge colorScheme="yellow" ml={2}>Anulado</Badge>
          )}
          {item.status === 'prepared' && onVoidItem && (
            <Button size="xs" colorScheme="yellow" ml={2} onClick={() => onVoidItem(order.order_id, item.menu_item_id)}>
              Anular
            </Button>
          )}
          {(item.status === 'ordered' || item.status === 'pending') && onCancelItem && (
            <Button size="xs" colorScheme="red" ml={2} onClick={() => onCancelItem(order.order_id, item.menu_item_id)}>
              Cancelar
            </Button>
          )}
        </Flex>
      ))}
    </Box>
    <Box borderBottom="1px solid #E2E8F0" mb={3} />
    <Stack direction="row" spacing={3}>
      {order.status !== 'delivered' && order.status !== 'paid' && order.status !== 'canceled' && (
        <Button colorScheme="blackAlpha" onClick={() => onDeliver(order.order_id)}>
          Marcar como Entregado
        </Button>
      )}
      {order.status === 'delivered' && (
        <Button colorScheme="green" onClick={() => onPay(order.order_id)}>
          Marcar como Pagado
        </Button>
      )}
      {order.status === 'ordered' && onAddDishes && (
        <Button colorScheme="blackAlpha" onClick={onAddDishes}>
          Agregar Platos
        </Button>
      )}
    </Stack>
  </Box>
);

export default OrderCard; 