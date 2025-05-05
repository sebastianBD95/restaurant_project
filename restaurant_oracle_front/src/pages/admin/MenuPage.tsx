import {
  Box,
  Grid,
  Image,
  Text,
  Button,
  Heading,
  NativeSelect,
  Textarea,
  Field,
  Dialog,
  Portal,
  Stack,
  Input,
  Accordion,
  AbsoluteCenter,
  GridItem,
  Flex
} from '@chakra-ui/react';
import { NumberInputField, NumberInputRoot } from '../../components/ui/number-input';
import { useEffect, useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomField } from '../../components/ui/field';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { StepperInput } from '../../components/ui/stepper-input';
import { useNavigate } from 'react-router-dom';
import '../styles/MenuPage.css';
import { MenuData, MenuItemRequest, MenuItemResponse } from '../../interfaces/menuItems';
import { addMenu, getMenus } from '../../services/menuService';
import { getCookie } from '../utils/cookieManager';
import {useParams } from 'react-router-dom';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import MenuCategory from '../../components/menu/MenuCategory';
import Cart from '../../components/menu/Cart';
import { placeOrder as placeOrderService } from '../../services/orderService';

const formSchema = z.object({
  quantity: z.string({ message: 'Debe seleccionar una cantidad válida.' }),
});

type FormValues = z.infer<typeof formSchema>;

const categoryMap: Record<string, string> = {
  entrada: 'Appetizer',
  'platoFuerte': 'Main',
  postres: 'Desserts',
  bebidas: 'Drinks',
};

const MenuPage: React.FC = () => {
  const [menuData, setMenuData] = useState<MenuData>({
    entrada: [],
    platoFuerte: [],
    postres: [],
    bebidas: [],
  });
  const { restaurantId } = useParams();
  const [cart, setCart] = useState<any[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [observations, setObservations] = useState('');
  const [recetas, setRecetas] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
  });
  const [error, setError] = useState('');
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const dialogRef = useRef<HTMLButtonElement>(null);
  const { isSidebarOpen, toggleSidebar, handleHomeClick } = useSidebar();

  const navigate = useNavigate();

  useEffect(() => {
    fetchMenuItems();
    const storedRecetas = localStorage.getItem('recetasPlatos');
    const storedInventario = localStorage.getItem('alimentosGuardados');

    if (storedRecetas) setRecetas(JSON.parse(storedRecetas));
    if (storedInventario) setInventario(JSON.parse(storedInventario));
  }, []);

  const fetchMenuItems = async () => {
    try {
      let token = getCookie(document.cookie, 'token');
      if (!token) {
        setError('No authentication token found');
        return;
      }
      const response = await getMenus(token, restaurantId!);
      
      let menuItems = response as MenuItemResponse[];
      const appetizers = menuItems.filter(item => item.category === 'Appetizer');
      const mainCourses = menuItems.filter(item => item.category === 'Main');
      const desserts = menuItems.filter(item => item.category === 'Desserts');
      const drinks = menuItems.filter(item => item.category === 'Drinks');
      
      setMenuData({
        entrada: appetizers,
        platoFuerte: mainCourses,
        postres: desserts,
        bebidas: drinks,
      });

    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if the file exceeds the maximum size
      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size exceeds 10 MB. Please upload a smaller file.');
        setFile(null); // Clear the selected file
      } else {
        setError(''); // Clear any previous error
        setFile(selectedFile); // Set the selected file
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent, category: string) => {
    e.preventDefault();

    if (!formData.name || !formData.description || file == undefined || formData.price < 0) {
      alert('Please complete all fields.');
      return;
    }

    let menuData: MenuItemRequest = {
      name: formData.name,
      description: formData.description,
      image: file!,
      price: formData.price,
      category: categoryMap[category]
    };

    try {
      let token = getCookie(document.cookie, 'token');
      if (!token) {
        setError('No authentication token found');
        return;
      }
      await addMenu(menuData, token, restaurantId!);
      
      setFile(null);
      setImagePreview(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
      });
      
      await fetchMenuItems();
      
    } catch (error: any) {
      setError(error.message);
    }
  };

  const addToCart = (item: MenuItemResponse, quantity: number, observation: string) => {
    if (quantity > 0) {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.menu_item_id === item.menu_item_id);
        if (existingItemIndex !== -1) {
          prevCart[existingItemIndex].quantity += quantity;
          prevCart[existingItemIndex].observation += ` | ${observation}`;
          return [...prevCart];
        } else {
          return [...prevCart, { ...item, quantity, observation }];
        }
      });
    }
  };

  const updateCartQuantity = (id: string, newQuantity: number) => {
    if (!orderPlaced) {
      setCart((prevCart) =>
        prevCart
          .map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
          .filter((item) => item.quantity > 0)
      );
    }
  };

  const placeOrder = async () => {
    if (!tableNumber.trim()) {
      alert('Por favor, selecciona un número de mesa antes de ordenar.');
      return;
    }

    if (cart.length === 0) {
      alert('No puedes hacer un pedido vacío.');
      return;
    }

    try {
      const orderData = {
        table_id: tableNumber,
        restaurant_id: restaurantId,
        status: 'ordered',
        items: cart.map(item => ({
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          observation: item.observation,
          price: item.price
        })),
        total_price: totalCost
      };
      console.log(orderData);
      await placeOrderService(orderData);
      setCart([]);
      setObservations('');
      setOrderPlaced(true);
      alert(`Pedido realizado con éxito en la mesa ${tableNumber}.`);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error al realizar el pedido. Por favor, intente nuevamente.');
    }
  };

  const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const platoDisponible = (platoName: string) => {
    const receta = recetas.find((r) => r.nombre === platoName);
    if (!receta) return true;
    return receta.ingredientes.every((ing: any) => {
      const encontrado = inventario.find((i) => i.id === ing.alimentoId);
      return encontrado && encontrado.cantidad >= ing.cantidad;
    });
  };

  return (
    <Flex height="100vh" direction="row">
      {/* Barra lateral de navegación plegable */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        restaurantId={restaurantId}
      />

      {/* Contenido Principal */}
      <Box flex={1} p={6} overflowY="auto">
        <Box p={8} bg="gray.100" minH="100vh">
          <Heading textAlign="center" mb={6}>
            Menú
          </Heading>
          
          
          <Accordion.Root collapsible>
            {Object.entries(menuData).map(([category, items]) => (
              <MenuCategory
                key={category}
                category={category}
                items={items}
                categoryMap={categoryMap}
                onSubmit={handleSubmit}
                error={error}
                MAX_FILE_SIZE={MAX_FILE_SIZE}
                onAddToCart={addToCart}
                orderPlaced={orderPlaced}
                platoDisponible={platoDisponible}
              />
            ))}
          </Accordion.Root>

          <Cart
            cart={cart}
            orderPlaced={orderPlaced}
            tableNumber={tableNumber}
            setTableNumber={setTableNumber}
            observations={observations}
            setObservations={setObservations}
            updateCartQuantity={updateCartQuantity}
            placeOrder={placeOrder}
          />
        </Box>
      </Box>
    </Flex>
  );
};

export default MenuPage;
