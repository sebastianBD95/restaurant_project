import React from 'react';
import { Box, Text, Button, Image, Flex } from '@chakra-ui/react';
import { DialogRoot, DialogContent, DialogHeader, DialogBody, DialogFooter } from '../ui/dialog';
import { NumberInputRoot, NumberInputField } from '../ui/number-input';
import { MenuItemResponse } from '../../interfaces/menuItems';

interface AddDishesDialogProps {
  open: boolean;
  onClose: () => void;
  menuItems: MenuItemResponse[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedDishes: { [id: string]: number };
  handleDishQuantityChange: (menu_item_id: string, quantity: number) => void;
  handleAddDishesSubmit: () => void;
}

const AddDishesDialog: React.FC<AddDishesDialogProps> = ({
  open,
  onClose,
  menuItems,
  categories,
  selectedCategory,
  setSelectedCategory,
  selectedDishes,
  handleDishQuantityChange,
  handleAddDishesSubmit,
}) => {
  const filteredDishes = menuItems.filter(item => item.category === selectedCategory);

  return (
    <DialogRoot open={open} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>Agregar Platos al Pedido</DialogHeader>
        <DialogBody>
          <Box mb={4}>
            <Text mb={1} fontWeight="bold">Categoría</Text>
            <select
              value={selectedCategory}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', marginBottom: '8px', border: '1px solid #CBD5E0' }}
            >
              <option value="">Selecciona una categoría</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </Box>
          <Box borderBottom="1px solid #E2E8F0" mb={4} />

          {!selectedCategory ? (
            <Text color="gray.500" textAlign="center" mb={2}>
              Selecciona una categoría para ver los platos disponibles.
            </Text>
          ) : filteredDishes.length === 0 ? (
            <Text color="gray.500" textAlign="center" mb={2}>
              No hay platos disponibles en esta categoría.
            </Text>
          ) : (
            <Box>
              {filteredDishes.map(item => (
                <Flex
                  key={item.menu_item_id}
                  align="center"
                  mb={3}
                  p={2}
                  borderRadius="md"
                  bg="gray.50"
                  _hover={{ bg: "gray.100" }}
                  boxShadow="sm"
                >
                  {item.image_url && (
                    <Image
                      src={item.image_url}
                      alt={item.name}
                      boxSize="40px"
                      objectFit="cover"
                      borderRadius="md"
                      mr={3}
                    />
                  )}
                  <Box flex={1}>
                    <Text fontWeight="medium">{item.name}</Text>
                    <Text fontSize="sm" color="gray.600">${item.price}</Text>
                  </Box>
                  <NumberInputRoot
                    min={0}
                    max={99}
                    width="80px"
                    value={selectedDishes[item.menu_item_id]?.toString() || ''}
                    onValueChange={({ value }) => handleDishQuantityChange(item.menu_item_id, Number(value))}
                  >
                    <NumberInputField />
                  </NumberInputRoot>
                </Flex>
              ))}
            </Box>
          )}
        </DialogBody>
        <DialogFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleAddDishesSubmit}
            disabled={Object.values(selectedDishes).filter(qty => qty > 0).length === 0}
          >
            Agregar
          </Button>
          <Button onClick={onClose}>Cancelar</Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
};

export default AddDishesDialog; 