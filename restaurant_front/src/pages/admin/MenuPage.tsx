import { Box, Heading, Accordion, Flex, Spinner } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import '../styles/MenuPage.css';
import { MenuData, MenuItemRequest, MenuItemResponse } from '../../interfaces/menuItems';
import { Ingredient } from '../../interfaces/ingredients';
import { addMenu, getMenus, editMenuItem } from '../../services/menuService';
import { getCookie } from '../utils/cookieManager';
import { useParams } from 'react-router-dom';
import { ResponsiveSidebar } from '../../components/ui/ResponsiveSidebar';
import { useResponsive } from '../../hooks/useResponsive';
import MenuCategory from '../../components/menu/MenuCategory';
import Cart from '../../components/menu/Cart';
import { placeOrder as placeOrderService } from '../../services/orderService';
import { toaster } from '../../components/ui/toaster';
import { useTables } from '../../hooks/useTables';

const _formSchema = z.object({
  quantity: z.string({ message: 'Debe seleccionar una cantidad válida.' }),
});

const categoryMap: Record<string, string> = {
  entrada: 'Appetizer',
  platoFuerte: 'Main',
  postres: 'Desserts',
  bebidas: 'Drinks',
  extras: 'Side',
};

const MenuPage: React.FC = () => {
  const [menuData, setMenuData] = useState<MenuData>({
    entrada: [],
    platoFuerte: [],
    postres: [],
    bebidas: [],
    sopas: [],
    ensaladas: [],
    extras: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { restaurantId } = useParams();
  const [cart, setCart] = useState<any[]>([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [observations, setObservations] = useState('');

  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    sideDishes: 0,
  });
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
  const _dialogRef = useRef<HTMLButtonElement>(null);
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const _navigate = useNavigate();

  // Use the useTables hook at the top level
  const {
    tables,
    loading: tablesLoading,
    error: tablesError,
    fetchTables,
  } = useTables(restaurantId);

  useEffect(() => {
    fetchMenuItems();
    fetchTables(); // Fetch tables on mount and when restaurantId changes
  }, [restaurantId]);

  const fetchMenuItems = async () => {
    setIsLoading(true);
    setError('');
    try {
      const token = getCookie(document.cookie, 'token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const response = await getMenus(token, restaurantId!);

      const menuItems = response as MenuItemResponse[];
      const appetizers = menuItems.filter((item) => item.category === 'Appetizer');
      const mainCourses = menuItems.filter((item) => item.category === 'Main');
      const desserts = menuItems.filter((item) => item.category === 'Desserts');
      const drinks = menuItems.filter((item) => item.category === 'Drinks');
      const soups = menuItems.filter((item) => item.category === 'Soup');
      const salads = menuItems.filter((item) => item.category === 'Salad');
      const sides = menuItems.filter((item) => item.category === 'Side');

      setMenuData({
        entrada: appetizers,
        platoFuerte: mainCourses,
        postres: desserts,
        bebidas: drinks,
        sopas: soups,
        ensaladas: salads,
        extras: sides,
      });
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setError('Error loading menu items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError('File size must be less than 10MB');
      return;
    }

    try {
      const token = getCookie(document.cookie, 'token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('sideDishes', formData.sideDishes.toString());
      formDataToSend.append('image', file);
      formDataToSend.append('restaurant_id', restaurantId!);

      await addMenu(token, formDataToSend);
      toaster.create({
        title: 'Success',
        description: 'Menu item added successfully',
        type: 'success',
      });
      fetchMenuItems();
      setFormData({ name: '', description: '', price: 0, sideDishes: 0 });
      setFile(null);
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError('Error adding menu item. Please try again.');
    }
  };

  const addToCart = (
    item: MenuItemResponse,
    quantity: number,
    observation: string,
    selectedSides: string[] = []
  ) => {
    const obs = observation.trim() === '' ? 'No observation' : observation.trim();
    if (quantity > 0) {
      setCart((prevCart) => {
        // Find if an item with the same menu_item_id, observation, and selectedSides exists
        const existingItemIndex = prevCart.findIndex(
          (cartItem) =>
            cartItem.menu_item_id === item.menu_item_id &&
            cartItem.observation.trim() === obs &&
            JSON.stringify(cartItem.selectedSides || []) === JSON.stringify(selectedSides)
        );
        if (existingItemIndex !== -1) {
          // Increment quantity for the matching item
          return prevCart.map((cartItem, idx) =>
            idx === existingItemIndex
              ? { ...cartItem, quantity: cartItem.quantity + quantity }
              : cartItem
          );
        } else {
          // Add new item
          return [...prevCart, { ...item, quantity, observation: obs, selectedSides }];
        }
      });
    }
  };

  const updateCartQuantity = (id: string, newQuantity: number) => {
    if (!orderPlaced) {
      setCart((prevCart) => {
        return prevCart
          .map((item) => (item.menu_item_id === id ? { ...item, quantity: newQuantity } : item))
          .filter((item) => item.quantity > 0);
      });
    }
  };

  const placeOrder = async () => {
    if (!tableNumber.trim()) {
      toaster.create({
        title: 'Error',
        description: 'Por favor, selecciona un número de mesa antes de ordenar.',
        type: 'error',
        duration: 5000,
      });
      return;
    }

    if (cart.length === 0) {
      toaster.create({
        title: 'Error',
        description: 'No puedes hacer un pedido vacío.',
        type: 'error',
        duration: 5000,
      });
      return;
    }

    try {
      // Build the order items array
      const items = cart.flatMap((item) => {
        // Main dish
        const main = {
          menu_item_id: item.menu_item_id,
          quantity: item.quantity,
          observation: item.observation,
          price: item.price,
        };
        // Side dishes (each as a separate item, price 0)
        const sides = (item.selectedSides || []).map((sideId: string) => ({
          menu_item_id: sideId,
          quantity: item.quantity,
          observation: `Guarnición de ${item.name}`,
          price: 0,
        }));
        return [main, ...sides];
      });

      const orderData = {
        table_id: tableNumber,
        restaurant_id: restaurantId,
        status: 'ordered',
        items,
        total_price: totalCost, // This will still be the sum of main dishes only
      };

      await placeOrderService(orderData);
      toaster.create({
        title: 'Pedido realizado con éxito',
        description: `Pedido realizado con éxito en la mesa ${tableNumber}.`,
        type: 'success',
      });
      setCart([]);
      setObservations('');
      setOrderPlaced(false);
      fetchTables();
    } catch (error) {
      console.error('Error placing order:', error);
      toaster.create({
        title: 'Error al realizar el pedido',
        description: 'Error al realizar el pedido. Por favor, intente nuevamente.',
        type: 'error',
      });
    }
  };

  const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  // Function to check if a dish is available for ordering
  const platoDisponible = (platoName: string): boolean => {
    // For now, assume all dishes are available
    // You can implement more complex logic here based on inventory, time, etc.
    return true;
  };

  return (
    <div className="page-wrapper">
      <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
        {/* Responsive Sidebar */}
        <ResponsiveSidebar restaurantId={restaurantId} />

        {/* Contenido Principal */}
        <Box 
          flex={1} 
          p={{ base: 2, sm: 3, md: 4, lg: 6 }} 
          overflowY="auto"
          ml={{ base: 0, md: 0 }}
        >
          <Box 
            p={{ base: 3, sm: 4, md: 6, lg: 8 }} 
            bg="gray.100" 
            minH="100vh"
            borderRadius={{ base: 'none', md: 'md' }}
          >
            <Heading 
              textAlign="center" 
              mb={{ base: 4, md: 6, lg: 8 }} 
              fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
              color="gray.800"
            >
              Menú
            </Heading>

            {isLoading ? (
              <Box 
                display="flex" 
                justifyContent="center" 
                alignItems="center" 
                minH={{ base: '150px', md: '200px', lg: '250px' }}
              >
                <Spinner size={{ base: 'lg', md: 'xl', lg: '2xl' }} />
              </Box>
            ) : error ? (
              <Box 
                textAlign="center" 
                p={{ base: 3, md: 4, lg: 6 }} 
                bg="red.50" 
                color="red.600" 
                borderRadius={{ base: 'sm', md: 'md' }}
                fontSize={{ base: 'sm', md: 'md' }}
              >
                {error || 'An unexpected error occurred'}
              </Box>
            ) : (
              <>
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
                      formData={formData}
                      setFormData={setFormData}
                      file={file}
                      setFile={setFile}
                      onMenuUpdate={fetchMenuItems}
                      ingredients={ingredients}
                      setIngredients={setIngredients}
                      allMenuItems={Object.values(menuData).flat()}
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
                  allMenuItems={Object.values(menuData).flat()}
                />
              </>
            )}
          </Box>
        </Box>
      </Flex>
    </div>
  );
};

export default MenuPage;
