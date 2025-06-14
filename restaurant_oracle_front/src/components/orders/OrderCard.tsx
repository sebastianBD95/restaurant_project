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
  onVoidItem: (orderId: string, menuItemId: string, observation: string) => void;
  onCancelItem: (orderId: string, menuItemId: string, observation: string) => void;
  onUpdateOrderItem: (orderId: string, menuItemId: string, observation: string, status: string) => void;
  onAddDishes?: () => void;
}

const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onDeliver,
  onPay,
  highlight,
  onVoidItem,
  onCancelItem,
  onUpdateOrderItem,
  onAddDishes,
}) => {
  // Group items
  const mainDishes = order.items.filter((item: OrderItem) =>
    item.status !== 'cancelled' && item.price > 0 && (!item.observation || !item.observation.startsWith('Guarnición de '))
  );
  const sideDishes = order.items.filter((item: OrderItem) =>
    item.status !== 'cancelled' && item.price === 0 && item.observation && item.observation.startsWith('Guarnición de ')
  );
  const extras = order.items.filter((item: OrderItem) =>
    item.status !== 'cancelled' &&
    item.price > 0 &&
    (!mainDishes.includes(item)) &&
    (!sideDishes.includes(item))
  );

  // Cancel main dish and its side dishes
  const handleCancelWithSides = (mainItem: OrderItem) => {
    onCancelItem(order.order_id, mainItem.menu_item_id, mainItem.observation);
    order.items
      .filter(
        (item) =>
          item.price === 0 &&
          item.observation === `Guarnición de ${mainItem.name}` &&
          item.status !== 'cancelled'
      )
      .forEach((side) => {
        onCancelItem(order.order_id, side.menu_item_id, side.observation);
      });
  };

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
        {/* Main dishes and their side dishes */}
        {mainDishes.map((main, idx) => (
          <Box key={idx} mb={1}>
            <Flex align="center" direction={{ base: 'column', sm: 'row' }} gap={1}>
              <Text flex={1} fontSize={{ base: 'sm', md: 'md' }}>
                <b>{main.quantity}x {main.name}</b> <span style={{ color: '#718096' }}>- ${main.price * main.quantity}</span>
                {main.observation && (
                  <Text as="span" color="gray.500" fontSize="sm"> - {main.observation}</Text>
                )}
              </Text>
              {main.status === 'void' && (
                <Badge colorScheme="yellow" ml={{ base: 0, sm: 2 }} mt={{ base: 1, sm: 0 }}>Anulado</Badge>
              )}
              {main.status === 'prepared' && (
                <>
                  <Button size="xs" colorPalette="green" ml={{ base: 0, sm: 2 }} mt={{ base: 1, sm: 0 }} onClick={() => onUpdateOrderItem(order.order_id, main.menu_item_id, main.observation, 'completed')}>
                    Entregado
                  </Button>
                  <Button size="xs" colorPalette="yellow" ml={{ base: 0, sm: 2 }} mt={{ base: 1, sm: 0 }} onClick={() => onVoidItem(order.order_id, main.menu_item_id, main.observation)}>
                    Anular
                  </Button>
                  <Button size="xs" colorPalette="blue" ml={{ base: 0, sm: 2 }} mt={{ base: 1, sm: 0 }} onClick={() => onUpdateOrderItem(order.order_id, main.menu_item_id, main.observation, 'pending')}>
                    Pendiente
                  </Button>
                </>
              )}
              {(main.status === 'ordered' || main.status === 'pending') && (
                <>
                  <Button size="xs" colorPalette="blue" ml={{ base: 0, sm: 2 }} mt={{ base: 1, sm: 0 }} onClick={() => onUpdateOrderItem(order.order_id, main.menu_item_id, main.observation, 'prepared')}>
                    Preparado
                  </Button>
                  <Button size="xs" colorPalette="red" ml={{ base: 0, sm: 2 }} mt={{ base: 1, sm: 0 }} onClick={() => handleCancelWithSides(main)}>
                    Cancelar
                  </Button>
                </>
              )}
            </Flex>
            {/* Side dishes for this main dish */}
            {sideDishes
              .filter(sd => sd.observation === `Guarnición de ${main.name}`)
              .map((sd, sidx) => (
                <Flex key={sidx} align="center" ml={6} gap={1}>
                  <Badge colorScheme="purple" mr={2}>Guarnición</Badge>
                  <Text fontSize="sm" color="gray.700">
                    {sd.quantity}x {sd.name}
                  </Text>
                </Flex>
              ))}
          </Box>
        ))}
        {/* Extras section */}
        {extras.length > 0 && (
          <Box mt={3}>
            <Text fontWeight="bold" color="gray.700" mb={1}>Extras:</Text>
            {extras.map((extra, eidx) => (
              <Flex key={eidx} align="center" ml={2} gap={1}>
                <Badge colorScheme="yellow" mr={2}>Extra</Badge>
                <Text fontSize="sm">
                  {extra.quantity}x {extra.name}
                </Text>
              </Flex>
            ))}
          </Box>
        )}
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