import React from 'react';
import { Stack, Input, Box, Image } from '@chakra-ui/react';
import { CustomField } from '../ui/field';

interface BasicInfoFormProps {
  formData: {
    name: string;
    description: string;
    price: number;
  };
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errors: {
    name: boolean;
    description: boolean;
    price: boolean;
    image: boolean;
  };
  imagePreview: string | null;
  initialData?: any;
}

const BasicInfoForm: React.FC<BasicInfoFormProps> = ({
  formData,
  handleChange,
  handleFileChange,
  errors,
  imagePreview,
  initialData
}) => {
  return (
    <form onSubmit={(e) => e.preventDefault()}>
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
  );
};

export default BasicInfoForm; 