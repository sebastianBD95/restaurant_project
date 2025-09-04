import React, { useState, FormEvent, useEffect } from 'react';
import { Box, Heading, Text, Table, IconButton, HStack, Flex } from '@chakra-ui/react';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import { isAdmin } from '../utils/roleUtils';
import { useNavigate, useParams } from 'react-router-dom';
import {
  createWaiterUser,
  getWaiterUsers,
  updateWaiterUser,
  deleteWaiterUser,
} from '../../services/waiterUserService';
import { WaiterUser } from '../../interfaces/waiter';
import { ResponsiveSidebar } from '../../components/ui/ResponsiveSidebar';
import { useResponsive } from '../../hooks/useResponsive';
import { Toaster, toaster } from '../../components/ui/toaster';
import WaiterUserForm from '../../components/waiters/WaiterUserForm';

// Custom toast function
const showToast = (
  title: string,
  description: string,
  status: 'success' | 'error' | 'info' = 'info'
) => {
  toaster.create({
    title: title,
    description: description,
    type: status,
  });
};

interface WaiterFormData {
  name: string;
  email: string;
  phone: string;
  password: string;
  restaurant_id?: string;
}

const WaiterUserPage: React.FC = () => {
  const [formData, setFormData] = useState<Omit<WaiterUser, 'user_id' | 'role'>>({
    name: '',
    email: '',
    phone: '',
    password: '',
    restaurant_id: '',
  });
  const [waiters, setWaiters] = useState<Omit<WaiterUser, 'password'>[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { restaurantId } = useParams();
  const { isMobile, isTablet, isDesktop } = useResponsive();

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
      showToast(
        'Acceso denegado',
        'Solo los administradores pueden acceder a esta página',
        'error'
      );
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
      const data = await getWaiterUsers(token, restaurantId!);
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const token = getToken();
      if (!token) {
        showToast('Error', 'No se encontró el token de autenticación', 'error');
        return;
      }

      if (isEditing && editingId) {
        await updateWaiterUser(editingId, formData, token);
        showToast('Éxito', 'Usuario mesero actualizado correctamente', 'success');
      } else {
        await createWaiterUser({ ...formData, restaurant_id: restaurantId! }, token);
        showToast('Éxito', 'Usuario mesero creado correctamente', 'success');
      }

      // Reset form and refresh data
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        restaurant_id: '',
      });
      setIsEditing(false);
      setEditingId(null);
      fetchWaiters();
    } catch (error) {
      showToast(
        'Error',
        isEditing
          ? 'No se pudo actualizar el usuario mesero'
          : 'No se pudo crear el usuario mesero',
        'error'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (waiter: Omit<WaiterUser, 'password'>) => {
    setFormData({
      name: waiter.name,
      email: waiter.email,
      phone: waiter.phone,
      password: '',
      restaurant_id: waiter.restaurant_id,
    });
    setIsEditing(true);
    setEditingId(waiter.user_id);
  };

  const handleDelete = async (userId: string) => {
    if (window.confirm('¿Está seguro de que desea eliminar este usuario mesero?')) {
      try {
        const token = getToken();
        if (!token) {
          showToast('Error', 'No se encontró el token de autenticación', 'error');
          return;
        }
        await deleteWaiterUser(userId, token);
        showToast('Éxito', 'Usuario mesero eliminado correctamente', 'success');
        fetchWaiters();
      } catch (error) {
        showToast('Error', 'No se pudo eliminar el usuario mesero', 'error');
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      restaurant_id: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <div className="page-wrapper">
      <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
        <ResponsiveSidebar restaurantId={restaurantId} />
        <Box 
          flex={1} 
          p={{ base: 2, sm: 3, md: 4, lg: 6 }} 
          maxW="100vw" 
          mx="auto"
          ml={{ base: 0, md: 0 }}
        >
          <Box 
            p={{ base: 3, sm: 4, md: 6, lg: 8 }} 
            bg="gray.100" 
            minH="100vh"
            borderRadius={{ base: 'none', md: 'md' }}
          >
            <Toaster />
            <Heading 
              mb={{ base: 3, md: 4, lg: 6 }} 
              fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }}
              color="gray.800"
              textAlign={{ base: 'center', md: 'left' }}
            >
              Gestión de Usuarios Meseros
            </Heading>
            <Heading 
              size={{ base: 'sm', md: 'md', lg: 'lg' }}
              mb={{ base: 3, md: 4, lg: 6 }}
              color="gray.700"
              textAlign={{ base: 'center', md: 'left' }}
            >
              {isEditing ? 'Editar Usuario Mesero' : 'Agregar Nuevo Usuario Mesero'}
            </Heading>
            <WaiterUserForm
              formData={formData}
              setFormData={setFormData}
              isEditing={isEditing}
              isLoading={isLoading}
              onCancel={handleCancel}
              onSubmit={handleSubmit}
            />
            <Box
              bg="white"
              p={{ base: 3, sm: 4, md: 5, lg: 6 }}
              borderRadius={{ base: 'md', md: 'lg' }}
              boxShadow={{ base: 'sm', md: 'md' }}
              overflowX="auto"
              w="100%"
              mt={{ base: 4, md: 5, lg: 6 }}
            >
              <Heading 
                size={{ base: 'sm', md: 'md', lg: 'lg' }}
                mb={{ base: 3, md: 4, lg: 6 }}
                color="gray.700"
                textAlign={{ base: 'center', md: 'left' }}
              >
                Lista de Usuarios Meseros
              </Heading>
              <Box overflowX="auto" w="100%">
                <Table.Root minWidth="600px">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader>Nombre</Table.ColumnHeader>
                      <Table.ColumnHeader>Correo</Table.ColumnHeader>
                      <Table.ColumnHeader>Teléfono</Table.ColumnHeader>
                      <Table.ColumnHeader>Acciones</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {isLoading ? (
                      <Table.Row>
                        <Table.Cell colSpan={4}>
                          <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            py={{ base: 4, md: 6, lg: 8 }}
                          >
                            <Text fontSize={{ base: 'sm', md: 'md' }}>
                              Cargando usuarios...
                            </Text>
                          </Box>
                        </Table.Cell>
                      </Table.Row>
                    ) : waiters.length === 0 ? (
                      <Table.Row>
                        <Table.Cell colSpan={4}>
                          <Box 
                            display="flex" 
                            justifyContent="center" 
                            alignItems="center" 
                            py={{ base: 4, md: 6, lg: 8 }}
                          >
                            <Text 
                              fontSize={{ base: 'sm', md: 'md' }}
                              color="gray.500"
                            >
                              No hay usuarios meseros registrados.
                            </Text>
                          </Box>
                        </Table.Cell>
                      </Table.Row>
                    ) : (
                      waiters.map((waiter) => (
                        <Table.Row key={waiter.role}>
                          <Table.Cell>{waiter.name}</Table.Cell>
                          <Table.Cell>{waiter.email}</Table.Cell>
                          <Table.Cell>{waiter.phone}</Table.Cell>
                          <Table.Cell>
                            <HStack 
                              spacing={{ base: 1, md: 2 }}
                              justify={{ base: 'center', md: 'flex-start' }}
                            >
                              <IconButton
                                aria-label="Editar mesero"
                                size={{ base: 'xs', sm: 'sm', md: 'md' }}
                                onClick={() => handleEdit(waiter)}
                                colorScheme="blue"
                              >
                                <FiEdit2 />
                              </IconButton>
                              <IconButton
                                aria-label="Eliminar mesero"
                                size={{ base: 'xs', sm: 'sm', md: 'md' }}
                                colorScheme="red"
                                onClick={() => handleDelete(waiter.user_id)}
                              >
                                <FiTrash2 />
                              </IconButton>
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table.Root>
              </Box>
            </Box>
          </Box>
        </Box>
      </Flex>
    </div>
  );
};

export default WaiterUserPage;
