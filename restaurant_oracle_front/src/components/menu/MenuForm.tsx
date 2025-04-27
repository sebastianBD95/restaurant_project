import React, { useRef, useState } from 'react';
import { Button, Dialog, Portal, Stack, Input, Field, Box, Image } from '@chakra-ui/react';
import { MenuItemRequest } from '../../interfaces/menuItems';

interface MenuFormProps {
  category: string;
  categoryMap: Record<string, string>;
  onSubmit: (e: React.FormEvent, category: string) => Promise<void>;
  error: string;
  MAX_FILE_SIZE: number;
}

const MenuForm: React.FC<MenuFormProps> = ({
  category,
  categoryMap,
  onSubmit,
  error,
  MAX_FILE_SIZE
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const dialogRef = useRef<HTMLButtonElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if the file exceeds the maximum size
      if (selectedFile.size > MAX_FILE_SIZE) {
        console.error('File size exceeds 10 MB. Please upload a smaller file.');
        setFile(null); // Clear the selected file
      } else {
        setFile(selectedFile); // Set the selected file
      }
    }
  };

  return (
    <Dialog.Root initialFocusEl={() => dialogRef.current}>
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
                    value={formData.price}
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
                <Button onClick={(e) => onSubmit(e, category)}>Guardar</Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default MenuForm; 