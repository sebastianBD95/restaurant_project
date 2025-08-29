import React from 'react';
import { Box, Button, Input, VStack, Text, HStack } from '@chakra-ui/react';

interface WaiterUserFormProps {
  formData: any;
  setFormData: (data: any) => void;
  isEditing: boolean;
  isLoading: boolean;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const WaiterUserForm: React.FC<WaiterUserFormProps> = ({
  formData,
  setFormData,
  isEditing,
  isLoading,
  onCancel,
  onSubmit,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <Box bg={isEditing ? 'blue.50' : 'white'} p={6} borderRadius="md" boxShadow="md" mb={6}>
      <form onSubmit={onSubmit}>
        <VStack align="stretch">
          <Box>
            <Text fontWeight="bold" mb={1}>
              Nombre Completo *
            </Text>
            <Input
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Ingrese el nombre completo"
              required
            />
          </Box>
          <Box>
            <Text fontWeight="bold" mb={1}>
              Correo Electrónico *
            </Text>
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
            <Text fontWeight="bold" mb={1}>
              Teléfono *
            </Text>
            <Input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Ingrese el número de teléfono"
              required
            />
          </Box>
          <Box>
            <Text fontWeight="bold" mb={1}>
              Contraseña *
            </Text>
            <Input
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={
                isEditing
                  ? 'Dejar en blanco para mantener la contraseña actual'
                  : 'Ingrese la contraseña'
              }
              required={!isEditing}
            />
          </Box>
          <HStack justify="flex-end">
            {isEditing && (
              <Button onClick={onCancel} variant="outline" loading={isLoading} type="button">
                Cancelar
              </Button>
            )}
            <Button type="submit" colorScheme="blue" loading={isLoading}>
              {isEditing ? 'Actualizar' : 'Agregar'}
            </Button>
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default WaiterUserForm;
