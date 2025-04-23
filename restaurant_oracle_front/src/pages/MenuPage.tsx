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
} from '@chakra-ui/react';
import { NumberInputField, NumberInputRoot } from '../components/ui/number-input';
import { useEffect, useState, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { CustomField } from '../components/ui/field';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { StepperInput } from '../components/ui/stepper-input';
import { useNavigate } from 'react-router-dom';
import './styles/MenuPage.css';

const formSchema = z.object({
  quantity: z.string({ message: 'Debe seleccionar una cantidad válida.' }),
});

type FormValues = z.infer<typeof formSchema>;

const menuData = {
  entrada: [
    {
      id: 1,
      name: 'Bruschetta',
      description: 'Pan tostado con tomate y albahaca.',
      price: 15000,
      image: '/images/Brucheta.jpeg',
    },
    {
      id: 2,
      name: 'Ensalada César',
      description: 'Lechuga, crutones y aderezo césar.',
      price: 15000,
      image: '/images/cesar.jpg',
    },
  ],
  platoFuerte: [
    {
      id: 3,
      name: 'Bife de Chorizo',
      description: 'Carne a la parrilla con papas fritas.',
      price: 25000,
      image: '/images/bife.jpg',
    },
    {
      id: 4,
      name: 'Pasta Alfredo',
      description: 'Pasta con salsa cremosa de queso parmesano.',
      price: 35000,
      image: '/images/Alfredo.jpg',
    },
  ],
  postres: [
    {
      id: 5,
      name: 'Tiramisú',
      description: 'Postre italiano con café y mascarpone.',
      price: 10000,
      image: '/images/tiramisu.jpg',
    },
    {
      id: 6,
      name: 'Cheesecake',
      description: 'Tarta de queso con frutos rojos.',
      price: 10000,
      image: '/images/chesecake.jpg',
    },
  ],
  bebidas: [
    {
      id: 7,
      name: 'Jugo de Naranja',
      description: 'Jugo natural de naranja recién exprimido.',
      price: 5000,
      image: '/images/naranja.jpg',
    },
    {
      id: 8,
      name: 'Café Espresso',
      description: 'Café fuerte y aromático.',
      price: 5000,
      image: '/images/cafe.jpg',
    },
  ],
};

const MenuPage: React.FC = () => {
  const [cart, setCart] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [tableNumber, setTableNumber] = useState('');
  const [observations, setObservations] = useState('');
  const [recetas, setRecetas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
  });
  const [error, setError] = useState('');
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

  const navigate = useNavigate();

  useEffect(() => {
    const storedRecetas = localStorage.getItem('recetasPlatos');
    const storedInventario = localStorage.getItem('alimentosGuardados');

    if (storedRecetas) setRecetas(JSON.parse(storedRecetas));
    if (storedInventario) setInventario(JSON.parse(storedInventario));
  }, []);

  const handleClick = () => navigate('/restaurantes');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  // Handle file input change
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
  const handleSubmit = (e: React.FormEvent, category : String) => {
    e.preventDefault();

    if (!formData.name || !formData.description || file == undefined) {
      alert('Please complete all fields.');
      return;
    }

    try {
      // Clear form fields after adding
      setFile(null);
      setImagePreview(null);
    } catch (error: any) {
      setError(error.message);
    }
  };

  const addToCart = (item, quantity, observation) => {
    if (quantity > 0) {
      setCart((prevCart) => {
        const existingItemIndex = prevCart.findIndex((cartItem) => cartItem.id === item.id);
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

  const updateCartQuantity = (id, newQuantity) => {
    if (!orderPlaced) {
      setCart((prevCart) =>
        prevCart
          .map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
          .filter((item) => item.quantity > 0)
      );
    }
  };

  const placeOrder = () => {
    if (!tableNumber.trim()) {
      alert('Por favor, selecciona un número de mesa antes de ordenar.');
      return;
    }

    if (cart.length === 0) {
      alert('No puedes hacer un pedido vacío.');
      return;
    }

    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    const newOrder = {
      table: tableNumber,
      items: cart,
      observations,
      timestamp: new Date().toLocaleString(),
    };

    localStorage.setItem('orders', JSON.stringify([...storedOrders, newOrder]));
    setCart([]);
    setObservations('');
    setOrderPlaced(true);
    alert(`Pedido realizado con éxito en la mesa ${tableNumber}.`);
  };

  const totalCost = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const platoDisponible = (platoName) => {
    const receta = recetas.find((r) => r.nombre === platoName);
    if (!receta) return true;
    return receta.ingredientes.every((ing) => {
      const encontrado = inventario.find((i) => i.id === ing.alimentoId);
      return encontrado && encontrado.cantidad >= ing.cantidad;
    });
  };

  return (
    <Box p={8} bg="gray.100" minH="100vh">
      <Heading textAlign="center" mb={6}>
        Menú
      </Heading>
      <Box></Box>
      <Accordion.Root collapsible>
        {Object.entries(menuData).map(([category, items]) => (
          <Accordion.Item key={category} value={category}>
            <Box position="relative">
              <Accordion.ItemTrigger>
                <Box
                  flex="1"
                  textAlign="left"
                  fontSize="lg"
                  fontWeight="bold"
                  textTransform="capitalize"
                >
                  {category.replace(/([A-Z])/g, ' $1').trim()}
                </Box>
              </Accordion.ItemTrigger>
              <AbsoluteCenter axis="vertical" insetEnd="0">
                <Dialog.Root initialFocusEl={() => ref.current}>
                  <Dialog.Trigger asChild>
                    <Button className="add-plate-button" size="xs">
                      Añadir Plato
                    </Button>
                  </Dialog.Trigger>
                  <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner>
                      <Dialog.Content>
                        <Dialog.Header>
                          <Dialog.Title>Restauranter</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body pb="4">
                          <Stack gap="4">
                            <Field.Root>
                              <Field.Label>Nombre</Field.Label>
                              <Input
                                placeholder="Nombre"
                                value={formData.name}
                                onChange={handleChange}
                                name="name"
                                required
                              />
                            </Field.Root>
                            <Field.Root>
                              <Field.Label>Descripcion</Field.Label>
                              <Input
                                placeholder="Descripcion"
                                value={formData.description}
                                onChange={handleChange}
                                name="description"
                                required
                              />
                            </Field.Root>
                            <Field.Root>
                              <Field.Label>Precio</Field.Label>
                              <Input
                                placeholder="Precio"
                                value={formData.description}
                                onChange={handleChange}
                                name="price"
                                required
                              />
                            </Field.Root>
                            <Field.Root>
                              <Field.Label>Imagen</Field.Label>
                              <Input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleFileChange}
                                required
                              />
                            </Field.Root>
                            <Field.Root>
                              {imagePreview && (
                                <Box mt={4}>
                                  <Field.Label>Pre-vista imagen </Field.Label>
                                  <Image
                                    border={1}
                                    src={imagePreview}
                                    alt="Image preview"
                                    boxSize="200px"
                                    objectFit="cover"
                                  />
                                </Box>
                              )}
                            </Field.Root>
                          </Stack>
                        </Dialog.Body>
                        <Dialog.Footer>
                          <Dialog.ActionTrigger asChild>
                            <Button variant="outline">Cancelar</Button>
                          </Dialog.ActionTrigger>
                          <Dialog.ActionTrigger asChild>
                            <Button onClick={(e) => handleSubmit(e, category)}>Guardar</Button>
                          </Dialog.ActionTrigger>
                        </Dialog.Footer>
                      </Dialog.Content>
                    </Dialog.Positioner>
                  </Portal>
                </Dialog.Root>
              </AbsoluteCenter>
            </Box>
            <Accordion.ItemContent>
              <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
                {items.map((item) => (
                  <MenuItem
                    key={item.id}
                    item={item}
                    onAdd={addToCart}
                    orderPlaced={orderPlaced}
                    disabled={!platoDisponible(item.name)}
                  />
                ))}
              </Grid>
            </Accordion.ItemContent>
          </Accordion.Item>
        ))}
      </Accordion.Root>

      <Box mt={6} p={4} bg="white" borderRadius="md" boxShadow="md">
        <Heading size="md" mb={4}>
          Pedido
        </Heading>

        <Text fontSize="md" fontWeight="bold" mb={2}>
          Número de Mesa
        </Text>
        <NativeSelect.Root size="sm" width="240px" mb={4}>
          <NativeSelect.Field
            placeholder="Selecciona una mesa"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
          >
            {Array.from({ length: 20 }, (_, i) => i + 1).map((table) => (
              <option key={table} value={table}>
                {table}
              </option>
            ))}
          </NativeSelect.Field>
          <NativeSelect.Indicator />
        </NativeSelect.Root>

        <Text fontSize="md" fontWeight="bold" mb={2}>
          Observaciones
        </Text>
        <Textarea
          placeholder="Escribe alguna observación sobre tu pedido..."
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          mb={4}
        />

        {cart.length === 0 ? (
          <Text>No has agregado ningún plato.</Text>
        ) : (
          cart.map((item) => (
            <Box
              key={item.id}
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Text>
                {item.quantity} - {item.name} - ${item.price * item.quantity} - {item.observation}
              </Text>
              {!orderPlaced && (
                <StepperInput
                  value={item.quantity.toString()}
                  onValueChange={(e) => updateCartQuantity(item.id, Number(e.value))}
                />
              )}
            </Box>
          ))
        )}

        <Text fontSize="lg" fontWeight="bold" mt={3}>
          Total: ${totalCost.toFixed(2)}
        </Text>
        <Button
          mt={4}
          colorScheme="green"
          width="full"
          onClick={() => {
            placeOrder();
            setCart([]);
            setTableNumber('');
            setOrderPlaced(false);
          }}
          disabled={cart.length === 0 || orderPlaced}
        >
          Ordenar
        </Button>
      </Box>
    </Box>
  );
};

const MenuItem = ({ item, onAdd, orderPlaced, disabled }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const [observation, setObservation] = useState('');

  return (
    <div>
      <Box
        bg="white"
        p={4}
        borderRadius="md"
        boxShadow="md"
        textAlign="center"
        display="flex"
        flexDirection="column"
        alignItems="center"
      >
        <Image
          src={item.image}
          alt={item.name}
          borderRadius="md"
          mb={3}
          boxSize="200px"
          objectFit="cover"
        />
        <Text fontSize="xl" fontWeight="bold">
          {item.name}
        </Text>
        <Text color="gray.600">{item.description}</Text>
        <Text fontSize="lg" fontWeight="bold" mt={2}>
          ${item.price.toFixed(2)}
        </Text>

        {disabled && (
          <Text color="red.500" fontWeight="bold" mt={2}>
            ⚠️ Fuera de servicio
          </Text>
        )}

        <CustomField
          label="Cantidad"
          invalid={!!errors.quantity}
          errorText={errors.quantity?.message}
        >
          <Controller
            name="quantity"
            control={control}
            render={({ field }) => (
              <NumberInputRoot
                disabled={field.disabled || disabled}
                name={field.name}
                value={field.value}
                onValueChange={({ value }) => {
                  field.onChange(value);
                }}
              >
                <NumberInputField onBlur={field.onBlur} />
              </NumberInputRoot>
            )}
          />
        </CustomField>

        <Textarea
          placeholder="Observaciones para este plato..."
          value={observation}
          onChange={(e) => setObservation(e.target.value)}
          mt={2}
          size="sm"
          isDisabled={disabled}
        />

        <Button
          mt={3}
          colorScheme="blue"
          onClick={() => handleSubmit((data) => onAdd(item, Number(data.quantity), observation))()}
          disabled={orderPlaced || disabled}
        >
          Agregar al Pedido
        </Button>
      </Box>
    </div>
  );
};

export default MenuPage;
