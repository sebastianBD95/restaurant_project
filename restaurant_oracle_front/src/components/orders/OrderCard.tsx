import React from 'react';
// import styles from '../../pages/styles/OrderCard.css';
import { Button, Heading, Text, Box } from '@chakra-ui/react';

interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  status: string;
  observation: string;
  image?: string;
}

interface Order {
  order_id: string;
  table_id: string;
  table: number;
  restaurant_id: string;
  items: OrderItem[];
  status: string;
  total_price: number;
}

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
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onDeliver, onPay, highlight, onVoidItem, onCancelItem }) => (
  <Box bg={highlight ? 'yellow.100' : 'white'} p={4} borderRadius="md" boxShadow="md" mb={4}>
    <Heading size="md">Mesa {order.table}</Heading>
    <Text fontSize="sm" color="gray.500">Total: ${order.total_price}</Text>
    {order.items.map((item, idx) => (
      <Box key={idx} mb={2}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>
            {item.quantity}x {item.name} - ${item.price * item.quantity}
            {item.observation && ` - ${item.observation}`}
          </span>
          {item.status === 'canceled' && (
            <Text as="span" color="red.500" fontWeight="bold" ml={2}>Cancelado</Text>
          )}
          {item.status === 'void' && (
            <Text as="span" color="yellow.500" fontWeight="bold" ml={2}>Anulado</Text>
          )}
          {item.status === 'prepared' && onVoidItem && (
            <Button size="xs" colorPalette="yellow" onClick={() => onVoidItem(order.order_id, item.menu_item_id)}>
              Anular
            </Button>
          )}
          {(item.status === 'ordered' || item.status === 'pending') && onCancelItem && (
            <Button size="xs" colorPalette="red" onClick={() => onCancelItem(order.order_id, item.menu_item_id)}>
              Cancelar
            </Button>
          )}
        </div>
      </Box>
    ))}
    <Text fontSize="md" fontWeight="bold" mt={3} color="purple.600">
      Estado: <span style={{ color: '#805ad5' }}>{statusMap[order.status] || order.status}</span>
    </Text>
    {order.status !== 'delivered' && order.status !== 'paid' && order.status !== 'canceled' && (
      <Button mt={2} colorScheme="blue" size="sm" onClick={() => onDeliver(order.order_id)}>
        Marcar como Entregado
      </Button>
    )}
    {order.status === 'delivered' && (
      <Button mt={2} colorScheme="green" size="sm" onClick={() => onPay(order.order_id)}>
        Marcar como Pagado
      </Button>
    )}
  </Box>
);

export default OrderCard; 