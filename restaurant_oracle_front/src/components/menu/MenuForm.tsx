import React, { useRef, useState, useEffect } from 'react';
import { Button, Dialog, Portal, Stack, Input, Box, Image } from '@chakra-ui/react';
import { CustomField } from '../ui/field';
import { MenuItemRequest, MenuItemResponse } from '../../interfaces/menuItems';

interface MenuFormProps {
  category: string;
  categoryMap: Record<string, string>;
  onSubmit: (e: React.FormEvent, category: string) => Promise<void>;
  error: string;
  MAX_FILE_SIZE: number;
  initialData?: MenuItemResponse;
  onClose?: () => void;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
  formData: {
    name: string;
    description: string;
    price: number;
  };
  setFormData: (data: { name: string; description: string; price: number }) => void;
  file: File | null;
  setFile: (file: File | null) => void;
}

const MenuForm: React.FC<MenuFormProps> = ({
  category,
  categoryMap,
  onSubmit,
  error,
  MAX_FILE_SIZE,
  initialData,
  onClose,
  isOpen,
  setIsOpen,
  formData,
  setFormData,
  file,
  setFile
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const dialogRef = useRef<HTMLButtonElement>(null);
  const [errors, setErrors] = useState({
    name: false,
    description: false,
    price: false,
    image: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: name === 'price' ? Number(value) || 0 : value 
    });
    setErrors({ ...errors, [name]: false });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > MAX_FILE_SIZE) {
        console.error('File size exceeds 10 MB. Please upload a smaller file.');
        setFile(null); 
        setErrors({ ...errors, image: true });
      } else {
        setFile(selectedFile); 
        const previewUrl = URL.createObjectURL(selectedFile);
        setImagePreview(previewUrl);
        setErrors({ ...errors, image: false });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate fields
    const newErrors = {
      name: !formData.name,
      description: !formData.description,
      price: !formData.price || formData.price <= 0,
      image: !file && !initialData,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    try {
      await onSubmit(e, category);
      setFormData({
        name: '',
        description: '',
        price: 0,
      });
      setFile(null);
      setImagePreview(null);
      setIsOpen?.(false);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Update image preview when initialData changes
  useEffect(() => {
    if (initialData?.image_url) {
      setImagePreview(initialData.image_url);
    }
  }, [initialData]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(details) => setIsOpen?.(details.open)} initialFocusEl={() => dialogRef.current}>
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{initialData ? 'Editar Plato' : 'Añadir Plato'}</Dialog.Title>
            </Dialog.Header>
            <Dialog.Body pb="4">
              <form onSubmit={handleSubmit}>
                <Stack gap="4">
                  <CustomField
                    label="Nombre"
                    required
                    errorText={errors.name ? "Este campo es obligatorio." : undefined}
                  >
                    <Input
                      placeholder="Nombre"
                      value={formData.name}
                      onChange={handleChange}
                      name="name"
                    />
                  </CustomField>
                  <CustomField
                    label="Descripcion"
                    required
                    errorText={errors.description ? "Este campo es obligatorio." : undefined}
                  >
                    <Input
                      placeholder="Descripcion"
                      value={formData.description}
                      onChange={handleChange}
                      name="description"
                    />
                  </CustomField>
                  <CustomField
                    label="Precio"
                    required
                    errorText={errors.price ? "Ingrese un precio válido mayor a 0." : undefined}
                  >
                    <Input
                      placeholder="Precio"
                      value={formData.price}
                      onChange={handleChange}
                      name="price"
                      type="number"
                      min="0"
                      step="0.01"
                    />
                  </CustomField>
                  <CustomField
                    label={`Imagen${initialData ? ' (opcional)' : ''}`}
                    required={!initialData}
                    errorText={errors.image ? "Debe seleccionar una imagen." : undefined}
                  >
                    <Input
                      type="file"
                      name="image"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </CustomField>
                  {imagePreview && (
                    <Box mt={4}>
                      <Box fontWeight="semibold" mb={2}>Pre-vista imagen</Box>
                      <Image
                        border={1}
                        src={imagePreview}
                        alt="Image preview"
                        boxSize="200px"
                        objectFit="cover"
                      />
                    </Box>
                  )}
                </Stack>
              </form>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      name: '',
                      description: '',
                      price: 0,
                    });
                    setFile(null);
                    setImagePreview(null);
                    setIsOpen?.(false);
                    setErrors({ name: false, description: false, price: false, image: false });
                  }}
                >
                  Cancelar
                </Button>
              </Dialog.ActionTrigger>
              <Dialog.ActionTrigger asChild>
                <Button onClick={handleSubmit}>
                  {initialData ? 'Actualizar' : 'Guardar'}
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default MenuForm; 