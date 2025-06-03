import React from 'react';
import { Button, Heading, Text, Box, Flex, Badge, Stack } from '@chakra-ui/react';
import { Order, OrderItem } from '../../interfaces/order';

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
}) => {
  return (
    <Box
      className={`card${highlight ? ' card-highlight' : ''}`}
    >
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'flex-start', sm: 'center' }} mb={2} gap={2}>
        <Heading size={{ base: 'sm', md: 'md' }} fontWeight="bold">
          Mesa {order.table}
        </Heading>
        <Badge className="status" colorScheme="purple" fontSize={{ base: '0.9em', md: '1em' }} px={3} py={1} borderRadius="md">
          {statusMap[order.status] || order.status}
        </Badge>
      </Flex>
      <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500" mb={2}>
        Total: <b>${order.total_price}</b>
      </Text>
      <Box borderBottom="1px solid #E2E8F0" mb={3} />
      <Box mb={3}>
        {order.items
          .filter((item: OrderItem) => item.status !== 'cancelled')
          .map((item: OrderItem, idx: number) => (
            <Flex key={idx} align="center" mb={1} direction={{ base: 'column', sm: 'row' }} gap={1}>
              <Text flex={1} fontSize={{ base: 'sm', md: 'md' }}>
                <b>{item.quantity}x {item.name}</b> <span style={{ color: '#718096' }}>- ${item.price * item.quantity}</span>
                {item.observation && (
                  <Text as="span" color="gray.500" fontSize="sm"> - {item.observation}</Text>
                )}
              </Text>
              {item.status === 'void' && (
                <Badge colorScheme="yellow" ml={{ base: 0, sm: 2 }} mt={{ base: 1, sm: 0 }}>Anulado</Badge>
              )}
              {item.status === 'prepared' && onVoidItem && (
                <Button size="xs" colorScheme="yellow" ml={{ base: 0, sm: 2 }} mt={{ base: 1, sm: 0 }} onClick={() => onVoidItem(order.order_id, item.menu_item_id)}>
                  Void
                </Button>
              )}
              {(item.status === 'ordered' || item.status === 'pending') && onCancelItem && (
                <Button size="xs" colorScheme="red" ml={{ base: 0, sm: 2 }} mt={{ base: 1, sm: 0 }} onClick={() => onCancelItem(order.order_id, item.menu_item_id)}>
                  Cancelar
                </Button>
              )}
            </Flex>
          ))}
      </Box>
      <Box borderBottom="1px solid #E2E8F0" mb={3} />
      <Stack 
        direction="column" 
        gap={3} 
        w="100%" 
        minW={0} 
        overflowX="auto"
      >
        {order.status !== 'delivered' && order.status !== 'paid' && order.status !== 'canceled' && (
          <Button 
            colorScheme="blackAlpha" 
            onClick={() => onDeliver(order.order_id)} 
            w="100%"
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 2, md: 4 }}
            py={{ base: 2, md: 3 }}
            whiteSpace="nowrap"
            minW={0}
          >
            Marcar como Entregado
          </Button>
        )}
        {order.status === 'delivered' && (
          <Button 
            colorScheme="green" 
            onClick={() => onPay(order.order_id)} 
            w="100%"
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 2, md: 4 }}
            py={{ base: 2, md: 3 }}
            whiteSpace="nowrap"
            minW={0}
          >
            Marcar como Pagado
          </Button>
        )}
        {order.status === 'ordered' && onAddDishes && (
          <Button 
            colorScheme="blackAlpha" 
            onClick={onAddDishes} 
            w="100%"
            fontSize={{ base: 'sm', md: 'md' }}
            px={{ base: 2, md: 4 }}
            py={{ base: 2, md: 3 }}
            whiteSpace="nowrap"
            minW={0}
          >
            Agregar Platos
          </Button>
        )}
      </Stack>
    </Box>
  );
};

export default OrderCard; 