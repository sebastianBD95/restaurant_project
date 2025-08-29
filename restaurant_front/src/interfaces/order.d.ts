export interface OrderItem {
  menu_item_id: string;
  name: string;
  quantity: number;
  price: number;
  status: string;
  observation: string;
  image?: string;
  created_at?: string;
}

export interface Order {
  order_id: string;
  table_id: string;
  table: number;
  restaurant_id: string;
  items: OrderItem[];
  status: string;
  total_price: number;
  time_to_prepare: number;
  time_to_deliver: number;
  time_to_pay: number;
  created_at: string;
}

export interface VoidOrderItem {
  void_order_item_id: string;
  menu_item_id: string;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  observation: string;
  void_reason: string;
  status: string;
  created_at?: string;
} 

interface OrderItem {
  menu_item_id: string;
  quantity: number;
}

interface OrderRequest {
  table_id: string;
  status: string;
  items: OrderItem[];
}

interface OrderStatusUpdate {
  order_id: string;
  status: string;
  time_to_prepare?: number;
  time_to_deliver?: number;
  time_to_pay?: number;
}