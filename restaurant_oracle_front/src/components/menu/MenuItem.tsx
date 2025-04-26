import React, { useState } from 'react';
import { Box, Image, Text, Button, Textarea } from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NumberInputField, NumberInputRoot } from '../ui/number-input';
import { CustomField } from '../ui/field';
import { MenuItemResponse } from '../../interfaces/menuItems';

const formSchema = z.object({
  quantity: z.string({ message: 'Debe seleccionar una cantidad válida.' }),
});

type FormValues = z.infer<typeof formSchema>;

interface MenuItemProps {
  item: MenuItemResponse;
  onAdd: (item: MenuItemResponse, quantity: number, observation: string) => void;
  orderPlaced: boolean;
  disabled: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ item, onAdd, orderPlaced, disabled }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const [observation, setObservation] = useState('');

  return (
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
        src={item.image_url}
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
        disabled={disabled}
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
  );
};

export default MenuItem; 