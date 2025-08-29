export interface MenuItemRequest {
  name: string;
  description: string;
  price: number;
  image: File;
  category: string;
  ingredients: Ingredient[];
  side_dishes: number;
}

export interface MenuItemResponse {
  menu_item_id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image_url: string;
  category: string;
  side_dishes: number;
  ingredients: {
    ingredient_id: string;
    menu_item_id: string;
    name: string;
    price: number;
    amount: number;
    unit: string;
  }[];
  hidden?: boolean;
}

export interface MenuData {
  entrada: MenuItemResponse[];
  platoFuerte: MenuItemResponse[];
  postres: MenuItemResponse[];
  bebidas: MenuItemResponse[];
  sopas: MenuItemResponse[];
  ensaladas: MenuItemResponse[];
  extras: MenuItemResponse[];
}
