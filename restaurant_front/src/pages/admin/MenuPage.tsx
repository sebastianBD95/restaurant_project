import { Box, Heading, Accordion, Flex, Spinner, VStack } from '@chakra-ui/react';
import { useEffect, useState, useRef } from 'react';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import '../styles/MenuPage.css';
import { MenuData, MenuItemRequest, MenuItemResponse } from '../../interfaces/menuItems';
import { Ingredient } from '../../interfaces/ingredients';
import { addMenu, getMenus, editMenuItem } from '../../services/menuService';
import { getCookie } from '../utils/cookieManager';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
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
  const { isSidebarOpen, toggleSidebar, handleHomeClick } = useSidebar();

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

      // After menuData is set, create a flat array of all menu items
      const allMenuItems: MenuItemResponse[] = Object.values(menuData).flat();
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error cargando platos.',
        type: 'error',
        duration: 5000,
      });
      setError('Error loading menu items. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
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

  const handleSubmit = async (
    e: React.FormEvent,
    category: string,
    ingredients: Ingredient[],
    editingItem?: MenuItemResponse
  ) => {
    e.preventDefault();

    if (!formData.name || !formData.description || (!file && !editingItem) || formData.price <= 0) {
      toaster.create({
        title: 'Error',
        description: 'Asurece todos los campos y el precio debe ser mayor que 0.',
        type: 'error',
        duration: 5000,
      });
      return;
    }

    const menuData: MenuItemRequest = {
      name: formData.name,
      description: formData.description,
      image: file || new File([], ''),
      price: Number(formData.price),
      side_dishes: Number(formData.sideDishes),
      category: categoryMap[category],
      ingredients: ingredients,
    };

    try {
      const token = getCookie(document.cookie, 'token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      if (editingItem) {
        // If we're editing and have a new file, use it. Otherwise, keep the existing image
        if (!file) {
          menuData.image = new File([], ''); // Empty file to indicate no new image
        }
        await editMenuItem(editingItem.menu_item_id, menuData, token, restaurantId!);
      } else {
        await addMenu(menuData, token, restaurantId!);
      }

      // Reset form state
      setFile(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        sideDishes: 0,
      });

      await fetchMenuItems();
    } catch (error: any) {
      setError(error.message);
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
    <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* Barra lateral de navegación plegable */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        restaurantId={restaurantId}
      />

      {/* Contenido Principal */}
      <Box flex={1} p={{ base: 2, md: 6 }} overflowY="auto">
        <Box p={{ base: 4, md: 8 }} bg="gray.100" minH="100vh">
          <Heading textAlign="center" mb={6} fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}>
            Menú
          </Heading>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minH="200px">
              <Spinner size="xl" />
            </Box>
          ) : error ? (
            <Box textAlign="center" p={4} bg="red.50" color="red.600" borderRadius="md">
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
  );
};

export default MenuPage;
