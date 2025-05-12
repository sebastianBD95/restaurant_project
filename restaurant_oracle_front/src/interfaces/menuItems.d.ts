export interface MenuItemRequest  {
    name: string;
    description: string;
    price: number;
    image: File;
    category: string;
    ingredients: Ingredient[];
  };

export interface MenuItemResponse  {
    menu_item_id: string
    name: string;
    description: string;
    price: number;
    image_url: string;
    category:string;
    hidden?: boolean;
  };
  
export interface MenuData  {
    entrada: MenuItemResponse[];
    platoFuerte: MenuItemResponse[];
    postres: MenuItemResponse[];
    bebidas: MenuItemResponse[];
  };