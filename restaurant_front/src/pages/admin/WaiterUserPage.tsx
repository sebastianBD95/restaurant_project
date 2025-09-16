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
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
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

  const validateForm = (formData: WaiterFormData, isEditing: boolean) => {
    return (
      formData.name && formData.email && formData.phone && (isEditing ? true : formData.password)
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm(formData, isEditing)) {
      showToast('Error', 'Por favor complete todos los campos', 'error');
      return;
    }

    formData.restaurant_id = restaurantId!;
    setIsLoading(true);

    try {
      const token = getToken();
      if (!token) {
        showToast('Error', 'No se encontró el token de autenticación', 'error');
        return;
      }

      if (isEditing && editingId) {
        await updateWaiterUser(editingId, formData, token);
        showToast(
          'Usuario actualizado',
          'El usuario mesero ha sido actualizado correctamente',
          'success'
        );
        setIsEditing(false);
        setEditingId(null);
      } else {
        await createWaiterUser(formData, token);
        showToast('Usuario creado', 'El usuario mesero ha sido creado correctamente', 'success');
      }

      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        restaurant_id: '',
      });
      fetchWaiters();
    } catch (error: any) {
      showToast('Límite del plan gratuito', error?.message || 'Has alcanzado el límite de 3 meseros del plan gratuito.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (waiter: Omit<WaiterUser, 'password'>) => {
    setFormData({
      name: waiter.name,
      email: waiter.email,
      phone: waiter.phone,
      password: '', // Don't show password for security
      restaurant_id: restaurantId!,
    });
    setIsEditing(true);
    setEditingId(waiter.user_id);
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
      restaurant_id: '',
    });
    setIsEditing(false);
    setEditingId(null);
  };

  return (
    <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        restaurantId={restaurantId}
      />
      <Box flex={1} p={{ base: 2, md: 6 }} maxW="100vw" mx="auto">
        <Toaster />
        <Heading mb={{ base: 4, md: 6 }} fontSize={{ base: 'lg', md: '2xl' }}>
          Gestión de Usuarios Meseros
        </Heading>
        <Heading size="md" mb={4}>
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
          p={{ base: 2, md: 6 }}
          borderRadius="md"
          boxShadow="md"
          overflowX="auto"
          w="100%"
        >
          <Heading size="md" mb={4}>
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
                      <Text>Cargando usuarios...</Text>
                    </Table.Cell>
                  </Table.Row>
                ) : waiters.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={4}>
                      <Text>No hay usuarios meseros registrados.</Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  waiters.map((waiter) => (
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
    </Flex>
  );
};

export default WaiterUserPage;
