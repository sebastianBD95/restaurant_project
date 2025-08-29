import React, { useState, useMemo } from 'react';
import {
  Box,
  Image,
  Text,
  Button,
  Textarea,
  Stack,
  Portal,
  createListCollection,
  Wrap,
  Badge,
  Select,
} from '@chakra-ui/react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { NumberInputField, NumberInputRoot } from '../ui/number-input';
import { CustomField } from '../ui/field';
import { MenuItemResponse } from '../../interfaces/menuItems';
import { isWaiter } from '../../pages/utils/roleUtils';

const formSchema = z.object({
  quantity: z
    .string()
    .refine((val) => Number(val) > 0, { message: 'Debe ingresar una cantidad positiva.' }),
});

interface MenuItemProps {
  item: MenuItemResponse;
  onAdd: (
    item: MenuItemResponse,
    quantity: number,
    observation: string,
    selectedSides: string[]
  ) => void;
  orderPlaced: boolean;
  disabled: boolean;
  onEdit?: (item: MenuItemResponse) => void;
  onDelete?: (item: MenuItemResponse) => void;
  onHide?: (item: MenuItemResponse) => void;
  allMenuItems: MenuItemResponse[];
}

const MenuItem: React.FC<MenuItemProps> = ({
  item,
  onAdd,
  orderPlaced,
  disabled,
  onEdit,
  onDelete,
  onHide,
  allMenuItems,
}) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
  });
  const [observation, setObservation] = useState('');
  const [selectedSides, setSelectedSides] = useState<string[]>(Array(item.side_dishes).fill(''));

  // Get available side dishes
  const availableSides = allMenuItems.filter((mi) => mi.category === 'Side');

  const allSideItems = availableSides.map((side) => ({
    label: side.name,
    value: side.menu_item_id,
  }));

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

      {isWaiter() && (
        <>
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
                  min={1}
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

          {/* Side dish selection */}
          {item.side_dishes > 0 && (
            <CustomField
              label={`Guarnición`}
              helperText={`Puedes elegir hasta ${item.side_dishes} guarnición${item.side_dishes > 1 ? 'es' : ''} para este plato.`}
            >
              <Stack gap={2}>
                {[...Array(item.side_dishes)].map((_, idx) => {
                  const collection = createListCollection({ items: allSideItems });
                  return (
                    <Select.Root
                      key={idx}
                      collection={collection}
                      size="sm"
                      width="250px"
                      value={selectedSides[idx] ? [selectedSides[idx]] : []}
                      onValueChange={({ value }) => {
                        const newSides = [...selectedSides];
                        newSides[idx] = value[0] || '';
                        setSelectedSides(newSides);
                      }}
                      disabled={disabled}
                    >
                      <Select.HiddenSelect />
                      <Select.Control>
                        <Select.Trigger>
                          <Select.ValueText placeholder={`Guarnición ${idx + 1}`} />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                          <Select.Indicator />
                        </Select.IndicatorGroup>
                      </Select.Control>
                      <Portal>
                        <Select.Positioner>
                          <Select.Content>
                            {allSideItems.length === 0 ? (
                              <Select.Item
                                item={{ label: 'No hay guarniciones', value: 'none' }}
                                key="none"
                              >
                                No hay guarniciones
                              </Select.Item>
                            ) : (
                              allSideItems.map((item) => (
                                <Select.Item item={item} key={item.value}>
                                  {item.label}
                                  <Select.ItemIndicator />
                                </Select.Item>
                              ))
                            )}
                          </Select.Content>
                        </Select.Positioner>
                      </Portal>
                    </Select.Root>
                  );
                })}
              </Stack>
            </CustomField>
          )}

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
            onClick={handleSubmit((data) =>
              onAdd(item, Number(data.quantity), observation, selectedSides)
            )}
          >
            Agregar al Pedido
          </Button>
        </>
      )}

      {!isWaiter() && (
        <Stack mt={2} direction="row" gap={2}>
          <Button size="sm" colorScheme="blue" onClick={() => onEdit && onEdit(item)}>
            Editar
          </Button>
          <Button size="sm" colorScheme="red" onClick={() => onDelete && onDelete(item)}>
            Eliminar
          </Button>
          <Button size="sm" colorScheme="gray" onClick={() => onHide && onHide(item)}>
            Ocultar
          </Button>
        </Stack>
      )}
    </Box>
  );
};

export default MenuItem;
