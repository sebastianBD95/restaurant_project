import React, { useState, FormEvent, useEffect } from 'react';
import { 
  Box, 
  Button, 
  Input, 
  VStack, 
  Heading, 
  Text, 
  Table,  
  IconButton, 
  HStack,
  Field,
  Flex,
} from '@chakra-ui/react';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import { isAdmin } from '../utils/roleUtils';
import { useNavigate, useParams } from 'react-router-dom';
import { createWaiterUser, getWaiterUsers, updateWaiterUser, deleteWaiterUser } from '../../services/waiterUserService';
import { WaiterUser } from '../../interfaces/waiter';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { Toaster, toaster } from "../../components/ui/toaster"


// Custom toast function
const showToast = (title: string, description: string, status: 'success' | 'error' | 'info' = 'info') => {
  console.log(`${status.toUpperCase()}: ${title} - ${description}`);
  // In a real app, you would use a proper toast library or component
};

const WaiterUserPage: React.FC = () => {
  const [formData, setFormData] = useState<Omit<WaiterUser, 'id' | 'role'>>({
    name: '',
    email: '',
    phone: '',
    password: '',
    restaurant_id: '',
  });
  const [waiters, setWaiters] = useState<Omit<WaiterUser, "id" | "password">[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { restaurantId } = useParams();
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  
  const navigate = useNavigate();

  // Get token from cookie
  const getToken = (): string | null => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; token=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  };

  // Check if user is admin
  useEffect(() => {
    if (!isAdmin()) {
      showToast('Acceso denegado', 'Solo los administradores pueden acceder a esta página', 'error');
      navigate('/');
    }
  }, [navigate]);

  // Load waiters from API
  const fetchWaiters = async () => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        showToast('Error', 'No se encontró el token de autenticación', 'error');
        return;
      }
      const data = await getWaiterUsers(token,restaurantId!);
      setWaiters(data);
    } catch (error) {
      showToast('Error', 'No se pudieron cargar los usuarios meseros', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWaiters();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      showToast('Error', 'Por favor complete todos los campos');
      return;
    }
    formData.restaurant_id = restaurantId!;

    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        showToast('Error', 'No se encontró el token de autenticación', 'error');
        return;
      }

      if (isEditing && editingId) {
        // Update existing waiter
        await updateWaiterUser(editingId, formData, token);
        showToast('Usuario actualizado', 'El usuario mesero ha sido actualizado correctamente', 'success');
        setIsEditing(false);
        setEditingId(null);
      } else {
        // Add new waiter
        await createWaiterUser(formData, token);
        showToast('Usuario creado', 'El usuario mesero ha sido creado correctamente', 'success');
      }

      // Reset form and refresh data
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        restaurant_id: ''
      });
      fetchWaiters();
    } catch (error) {
      showToast('Error', 'Ocurrió un error al procesar la solicitud', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (waiter: Omit<WaiterUser, "id" | "password">) => {
    /* setFormData({
      name: waiter.name,
      email: waiter.email,
      phone: waiter.phone,
      password: '', // Don't show password for security
      restaurant: ''
    });
    setIsEditing(true);
    setEditingId(waiter.name); */
    
    toaster.create({
      description: "File saved successfully",
      type: "info",
    })
  };

  const handleDelete = async (id: string) => {
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        showToast('Error', 'No se encontró el token de autenticación', 'error');
        return;
      }
      
      await deleteWaiterUser(id, token);
      showToast('Usuario eliminado', 'El usuario mesero ha sido eliminado correctamente', 'info');
      
      fetchWaiters();
    } catch (error) {
      showToast('Error', 'No se pudo eliminar el usuario mesero', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      restaurant_id: ''
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <Flex height="100vh" direction="row">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        restaurantId={restaurantId}
      />
    <Box flex={1} p={6} maxW="auto" mx="auto">
      <Toaster />
      <Heading mb={6}>Gestión de Usuarios Meseros</Heading>
      
      <Box bg="white" p={6} borderRadius="md" boxShadow="md" mb={6}>
        <Heading size="md" mb={4}>
          {isEditing ? 'Editar Usuario Mesero' : 'Agregar Nuevo Usuario Mesero'}
        </Heading>
        
        <form onSubmit={handleSubmit}>
          <VStack align="stretch">
            <Box>
              <Text fontWeight="bold" mb={1}>Nombre Completo *</Text>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ingrese el nombre completo"
                required
              />
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Correo Electrónico *</Text>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Ingrese el correo electrónico"
                required
              />
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Teléfono *</Text>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ingrese el número de teléfono"
                required
              />
            </Box>
            
            <Box>
              <Text fontWeight="bold" mb={1}>Contraseña *</Text>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={isEditing ? "Dejar en blanco para mantener la contraseña actual" : "Ingrese la contraseña"}
                required={!isEditing}
              />
            </Box>
            
            <HStack justify="flex-end">
              {isEditing && (
                <Button onClick={handleCancel} variant="outline">
                  Cancelar
                </Button>
              )}
              <Button type="submit" colorScheme="blue">
                {isEditing ? 'Actualizar' : 'Agregar'}
              </Button>
            </HStack>
          </VStack>
        </form>
      </Box>
      
      <Box bg="white" p={6} borderRadius="md" boxShadow="md">
        <Heading size="md" mb={4}>Lista de Usuarios Meseros</Heading>
        
        {isLoading ? (
          <Text>Cargando usuarios...</Text>
        ) : waiters.length === 0 ? (
          <Text>No hay usuarios meseros registrados.</Text>
        ) : (
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                <Table.ColumnHeader>Correo</Table.ColumnHeader>
                <Table.ColumnHeader>Teléfono</Table.ColumnHeader>
                <Table.ColumnHeader>Acciones</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {waiters.map(waiter => (
                <Table.Row key={waiter.role}>
                  <Table.Cell>{waiter.name}</Table.Cell>
                  <Table.Cell>{waiter.email}</Table.Cell>
                  <Table.Cell>{waiter.phone}</Table.Cell>
                  <Table.Cell>
                    <HStack>
                      <IconButton
                        aria-label="Editar mesero"
                        size="sm"
                        onClick={() => handleEdit(waiter)}
                      >
                        <FiEdit2 />
                      </IconButton>
                      <IconButton
                        aria-label="Eliminar mesero"
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDelete(waiter.email)}
                      >
                        <FiTrash2 />
                      </IconButton>
                    </HStack>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        )}
      </Box>
    </Box>
    </Flex> 
  );
};

export default WaiterUserPage; 