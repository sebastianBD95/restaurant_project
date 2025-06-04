export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  status: string;
  observation: string;
  image?: string;
}

export interface Order {
  order_id: string;
  table_id: string;
  table: number;
  restaurant_id: string;
  items: OrderItem[];
  status: string;
  total_price: number;
}

export interface VoidOrderItem {
  menu_item_id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  void_reason: string;
  status: string;
  created_at?: string;
} 