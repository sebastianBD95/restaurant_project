import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Box, Input, Button, Text, Image, Dialog, Portal, Stack, Field } from '@chakra-ui/react';
import Slider from 'react-slick';
import { addRestarurant, getRestaurants } from '../services/restaurantService';
import { ResturantDataRequest, ResturantDataResponse } from '../interfaces/restaurant';
import { getCookie } from './utils/cookieManager';
import { toaster } from '../components/ui/toaster';

const RestaurantPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [restaurants, setRestaurants] = useState<ResturantDataResponse[]>([]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024;

  const fetchRestaurants = async () => {
    try {
      const token = getCookie(document.cookie, 'token');
      console.log('token', token);
      if (!token) {
        toaster.create({
          title: 'Error',
          description: 'No authentication token found',
          type: 'error',
          duration: 5000,
        });
        return;
      }
      const response = await getRestaurants(token);
      setRestaurants(response);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error cargando restaurantes.',
        type: 'error',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    fetchRestaurants();
  }, []);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Check if the file exceeds the maximum size
      if (selectedFile.size > MAX_FILE_SIZE) {
        toaster.create({
          title: 'Error',
          description: 'File size exceeds 10 MB. Please upload a smaller file.',
          type: 'error',
          duration: 5000,
        });
        setFile(null); // Clear the selected file
      } else {
        setFile(selectedFile); // Set the selected file
      }
    }
  };

  // Handle form submission to add a restaurant
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.description || file === undefined) {
      toaster.create({
        title: 'Error',
        description: 'Please complete all fields.',
        type: 'error',
        duration: 5000,
      });
      return;
    }

    try {
      const restaurantData: ResturantDataRequest = {
        name: formData.name,
        description: formData.description,
        image: file!,
      };
      const token = getCookie(document.cookie, 'token');
      if (!token) {
        toaster.create({
          title: 'Error',
          description: 'No authentication token found',
          type: 'error',
          duration: 5000,
        });
        return;
      }
      addRestarurant(restaurantData, token);

      // Clear form fields after adding
      setFormData({ name: '', description: '' });
      setFile(null);
      setImagePreview(null);
      getRestaurants(token);
    } catch (error: unknown) {
      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        type: 'error',
        duration: 5000,
      });
    }
  };

  const slidesToShow = restaurants.length > 1 ? 3 : 1;

  // Settings for the carousel (horizontal)
  const carouselSettings = {
    dots: false,
    infinite: false,
    speed: 500,
    slidesToShow: slidesToShow,
    slidesToScroll: 1,
    centerMode: true,
  };

  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="page-wrapper">
      {restaurants.length === 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          mt={{ base: 4, md: 6, lg: 8 }}
          px={{ base: 2, md: 4, lg: 6 }}
        >
          <Text 
            fontSize={{ base: '2xl', md: '3xl', lg: '4xl' }} 
            fontWeight="bold" 
            mb={4}
            textAlign="center"
          >
            No has agregado ningun restaurante
          </Text>
          <Image
            src="/images/chef.png"
            alt="Sad Chef"
            boxSize={{ base: '200px', md: '250px', lg: '300px' }}
            objectFit="contain"
          />
        </Box>
      )}

      {/* Carousel to display added restaurants */}
      {restaurants.length > 0 && (
        <Box 
          mt={{ base: 6, md: 8 }} 
          px={{ base: 2, md: 4, lg: 6 }}
        >
          <Text 
            fontSize={{ base: 'lg', md: 'xl', lg: '2xl' }} 
            fontWeight="bold" 
            mb={{ base: 3, md: 4 }} 
            textAlign="center"
          >
            Mis Restaurantes
          </Text>
          <Slider {...carouselSettings}>
            {restaurants.map((restaurant, index) => (
              <Box key={index} textAlign="center" px={{ base: 1, md: 2 }}>
                <Link to={`/Dashboard/${restaurant.restaurant_id}`}>
                  <Text 
                    fontSize={{ base: 'md', md: 'lg', lg: 'xl' }} 
                    fontWeight="bold"
                    mb={2}
                  >
                    {restaurant.name}
                  </Text>
                  <Text 
                    fontSize={{ base: 'sm', md: 'md' }}
                    mb={3}
                    color="gray.600"
                  >
                    {restaurant.description}
                  </Text>
                  {/* Show image */}
                  <Image
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    boxSize={{ base: '250px', md: '300px', lg: '400px' }}
                    objectFit="cover"
                    mx="auto"
                    mb={4}
                    borderRadius="lg"
                    boxShadow="md"
                    _hover={{ transform: 'scale(1.05)', transition: 'transform 0.2s' }}
                  />
                </Link>
              </Box>
            ))}
          </Slider>
        </Box>
      )}

      <Box 
        display="flex" 
        justifyContent="center" 
        py={{ base: 8, md: 12, lg: 16 }}
        px={{ base: 2, md: 4, lg: 6 }}
      >
        <Dialog.Root initialFocusEl={() => ref.current}>
          <Dialog.Trigger asChild>
            <Button 
              variant="outline" 
              size={{ base: 'md', md: 'lg' }}
              px={{ base: 6, md: 8 }}
              py={{ base: 3, md: 4 }}
              fontSize={{ base: 'md', md: 'lg' }}
            >
              Agregar Restaurante
            </Button>
          </Dialog.Trigger>
                      <Portal>
              <Dialog.Backdrop />
              <Dialog.Positioner>
                <Dialog.Content
                  maxW={{ base: '90vw', md: '500px', lg: '600px' }}
                  maxH={{ base: '90vh', md: '80vh' }}
                  overflow="auto"
                >
                  <Dialog.Header>
                    <Dialog.Title fontSize={{ base: 'lg', md: 'xl' }}>
                      Agregar Restaurante
                    </Dialog.Title>
                  </Dialog.Header>
                  <Dialog.Body pb="4">
                    <Stack gap={{ base: 3, md: 4 }}>
                      <Field.Root>
                        <Field.Label fontSize={{ base: 'sm', md: 'md' }}>
                          Nombre
                        </Field.Label>
                        <Input
                          placeholder="Nombre del restaurante"
                          value={formData.name}
                          onChange={handleChange}
                          name="name"
                          required
                          size={{ base: 'md', md: 'lg' }}
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label fontSize={{ base: 'sm', md: 'md' }}>
                          Descripción
                        </Field.Label>
                        <Input
                          placeholder="Descripción del restaurante"
                          value={formData.description}
                          onChange={handleChange}
                          name="description"
                          required
                          size={{ base: 'md', md: 'lg' }}
                        />
                      </Field.Root>
                      <Field.Root>
                        <Field.Label fontSize={{ base: 'sm', md: 'md' }}>
                          Imagen
                        </Field.Label>
                        <Input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleFileChange}
                          required
                          size={{ base: 'md', md: 'lg' }}
                        />
                      </Field.Root>
                      <Field.Root>
                        {imagePreview && (
                          <Box mt={4}>
                            <Field.Label fontSize={{ base: 'sm', md: 'md' }}>
                              Vista previa de imagen
                            </Field.Label>
                            <Image
                              border={1}
                              src={imagePreview}
                              alt="Image preview"
                              boxSize={{ base: '150px', md: '200px', lg: '250px' }}
                              objectFit="cover"
                              borderRadius="md"
                              mx="auto"
                              display="block"
                            />
                          </Box>
                        )}
                      </Field.Root>
                    </Stack>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <Stack 
                      direction={{ base: 'column', md: 'row' }} 
                      spacing={{ base: 2, md: 3 }}
                      w="full"
                    >
                      <Dialog.ActionTrigger asChild>
                        <Button 
                          variant="outline" 
                          size={{ base: 'md', md: 'lg' }}
                          flex={1}
                        >
                          Cancelar
                        </Button>
                      </Dialog.ActionTrigger>
                      <Dialog.ActionTrigger asChild>
                        <Button 
                          onClick={handleSubmit}
                          size={{ base: 'md', md: 'lg' }}
                          flex={1}
                        >
                          Guardar
                        </Button>
                      </Dialog.ActionTrigger>
                    </Stack>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
      </Box>
    </div>
  );
};

export default RestaurantPage;
