import React from 'react';
// import styles from '../../pages/styles/OrderCard.css';
import { Button, Heading, Text, Box } from '@chakra-ui/react';

interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  observation: string;
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
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onDeliver, onPay, highlight }) => (
  <Box bg={highlight ? 'yellow.100' : 'white'} p={4} borderRadius="md" boxShadow="md" mb={4}>
    <Heading size="md">Mesa {order.table}</Heading>
    <Text fontSize="sm" color="gray.500">Total: ${order.total_price}</Text>
    {order.items.map((item, idx) => (
      <Text key={idx}>
        {item.quantity}x {item.name} - ${item.price * item.quantity}
        {item.observation && ` - ${item.observation}`}
      </Text>
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