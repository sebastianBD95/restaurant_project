export interface MenuItemRequest  {
    name: string;
    description: string;
    price: number;
    image: File;
    category: string;
  };

export interface MenuItemResponse  {
    menu_item_id: string
    name: string;
    description: string;
    price: number;
    image_url: string;
    category:string;
  };
  
export interface MenuData  {
    entrada: MenuItemResponse[];
    platoFuerte: MenuItemResponse[];
    postres: MenuItemResponse[];
    bebidas: MenuItemResponse[];
  };