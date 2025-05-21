import React, { useRef, useState, useEffect } from 'react';
import { Button, Dialog, Portal, Stack, Steps, ButtonGroup, Box, Text } from '@chakra-ui/react';
import { MenuItemResponse } from '../../interfaces/menuItems';
import BasicInfoForm from './BasicInfoForm';
import IngredientsForm from './IngredientsForm';
import { toaster } from '../ui/toaster';

interface Ingredient {
  raw_ingredient_id: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
}

interface MenuFormProps {
  category: string;
  categoryMap: Record<string, string>;
  onSubmit: (e: React.FormEvent, category: string, ingredients: Ingredient[], editingItem?: MenuItemResponse) => Promise<void>;
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
  ingredients: Ingredient[];
  setIngredients: (ingredients: Ingredient[]) => void;
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
  setFile,
  ingredients,
  setIngredients
}) => {
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null);
  const dialogRef = useRef<HTMLButtonElement>(null);
  const [errors, setErrors] = useState({
    name: false,
    description: false,
    price: false,
    image: false,
  });
  const [currentStep, setCurrentStep] = useState(0);

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const isStep1Valid = () => {
    return formData.name && formData.description && formData.price > 0 && (file || initialData?.image_url);
  };

  const isStep2Valid = () => {
    return ingredients.length > 0;
  };

  const isCurrentStepValid = () => {
    switch (currentStep) {
      case 0:
        return isStep1Valid();
      case 1:
        return isStep2Valid();
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

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
        toaster.create({
          title: 'Error',
          description: 'El tamaño del archivo excede 10 MB. Por favor, suba un archivo más pequeño.',
          type: 'error',
          duration: 5000,
        });
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
      ingredients: !ingredients,
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;
    try {
      await onSubmit(e, category, ingredients, initialData);
      setFormData({
        name: '',
        description: '',
        price: 0,
      });
      setFile(null);
      setImagePreview(null);
      setIsOpen?.(false);
      setIngredients([]);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error al enviar el formulario.',
        type: 'error',
        duration: 5000,
      });
    }
  };

  // Update image preview when initialData changes
  useEffect(() => {
    if (initialData?.image_url) {
      setImagePreview(initialData.image_url);
    }
  }, [initialData]);

  const steps = [
    {
      title: "Step 1",
      description: "Step 1 description",
      content: (
        <BasicInfoForm
          formData={formData}
          handleChange={handleChange}
          handleFileChange={handleFileChange}
          errors={errors}
          imagePreview={imagePreview}
          initialData={initialData}
        />
      )
    },
    {
      title: "Step 2",
      description: "Step 2 description",
      content: (
        <IngredientsForm
          ingredients={ingredients}
          onIngredientsChange={setIngredients}
        />
      )
    },
  ]

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
              <Steps.Root count={2} defaultStep={currentStep} onStepComplete={() => handleStepChange(currentStep + 1)}>
                <Steps.List>
                  {steps.map((step, index) => (
                    <Steps.Item key={index} index={index} title={step.title}>
                      <Steps.Indicator />
                      <Steps.Title>{step.title}</Steps.Title>
                      <Steps.Separator />
                    </Steps.Item>
                  ))}
                </Steps.List>

                {steps.map((step, index) => (
                  <Steps.Content key={index} index={index}>
                    {step.content}
                  </Steps.Content>
                ))}
                <Steps.CompletedContent>
                  <Box p={4} bg="gray.50" borderRadius="md">
                    <Text fontSize="lg" fontWeight="bold" mb={4}>Resumen de Datos</Text>
                    <Stack gap={4}>
                      <Box>
                        <Text fontWeight="semibold">Información Básica</Text>
                        <Box as="table" width="100%" mt={2}>
                          <Box as="tbody">
                            <Box as="tr">
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">Nombre:</Box>
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">{formData.name}</Box>
                            </Box>
                            <Box as="tr">
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">Descripción:</Box>
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">{formData.description}</Box>
                            </Box>
                            <Box as="tr">
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">Precio:</Box>
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">${formData.price.toFixed(2)}</Box>
                            </Box>
                            <Box as="tr">
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">Categoría:</Box>
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">{categoryMap[category]}</Box>
                            </Box>
                            <Box as="tr">
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">Imagen:</Box>
                              <Box as="td" p={2} borderBottom="1px" borderColor="gray.200">
                                {file ? file.name : initialData?.image_url ? 'Imagen existente' : 'No se ha seleccionado imagen'}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </Box>

                      <Box>
                        <Text fontWeight="semibold" mb={2}>Ingredientes</Text>
                        {ingredients.length > 0 ? (
                          <Box as="table" width="100%" mt={2}>
                            <Box as="thead">
                              <Box as="tr" bg="gray.100">
                                <Box as="th" p={2} textAlign="left">Ingrediente</Box>
                                <Box as="th" p={2} textAlign="right">Cantidad</Box>
                                <Box as="th" p={2} textAlign="left">Unidad</Box>
                                <Box as="th" p={2} textAlign="right">Precio</Box>
                              </Box>
                            </Box>
                            <Box as="tbody">
                              {ingredients.map((ingredient, index) => (
                                <Box as="tr" key={index} borderBottom="1px" borderColor="gray.200">
                                  <Box as="td" p={2}>{ingredient.name}</Box>
                                  <Box as="td" p={2} textAlign="right">{ingredient.quantity}</Box>
                                  <Box as="td" p={2}>{ingredient.unit}</Box>
                                  <Box as="td" p={2} textAlign="right">${ingredient.price.toFixed(2)}</Box>
                                </Box>
                              ))}
                            </Box>
                          </Box>
                        ) : (
                          <Text color="gray.500">No se han agregado ingredientes</Text>
                        )}
                      </Box>
                    </Stack>
                  </Box>
                </Steps.CompletedContent>

                <ButtonGroup size="sm" variant="outline">
                  <Steps.PrevTrigger asChild>
                    <Button onClick={handlePrev} >Prev</Button>
                  </Steps.PrevTrigger>
                  <Steps.NextTrigger asChild>
                    <Button 
                      onClick={handleNext} 
                      disabled={!isCurrentStepValid()}
                      hidden={currentStep === steps.length}
                    >
                      Next
                    </Button>
                  </Steps.NextTrigger>
                    <Button
                      hidden={currentStep !== steps.length} 
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
                        setIngredients([]);
                      }}
                    >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    hidden={currentStep !== steps.length}
                  >
                    {initialData ? 'Actualizar' : 'Guardar'}
                  </Button>
                </ButtonGroup>
              </Steps.Root>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default MenuForm; 