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

    if (!formData.name || !formData.description || file == undefined) {
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
    <div>
      {restaurants.length === 0 && (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          flexDirection="column"
          mt={8}
        >
          <Text fontSize="4xl" fontWeight="bold" mb={4}>
            No has agregado ningun restaurante
          </Text>
          <Image
            src="/images/chef.png" // Replace with the path to the uploaded image
            alt="Sad Chef"
            boxSize="250px"
            objectFit="contain"
          />
        </Box>
      )}

      {/* Carousel to display added restaurants */}
      {restaurants.length > 0 && (
        <Box mt={8}>
          <Text fontSize="xl" fontWeight="bold" mb={4} textAlign="center">
            Mis Restaurantes
          </Text>
          <Slider {...carouselSettings}>
            {restaurants.map((restaurant, index) => (
              <Box key={index} textAlign="center">
                <Link to={`/Dashboard/${restaurant.restaurant_id}`}>
                  <Text fontSize="lg" fontWeight="bold">
                    {restaurant.name}
                  </Text>
                  <Text>{restaurant.description}</Text>
                  {/* Show image */}
                  <Image
                    src={restaurant.image_url}
                    alt={restaurant.name}
                    boxSize="400px"
                    objectFit="cover"
                    mx="auto"
                    mb={4}
                  />
                </Link>
              </Box>
            ))}
          </Slider>
        </Box>
      )}

      <Box display="flex" justifyContent="center" padding={100}>
        <Dialog.Root initialFocusEl={() => ref.current}>
          <Dialog.Trigger asChild>
            <Button variant="outline" size="lg">
              Agregar Restaurante
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
                        placeholder="Restaurant Description"
                        value={formData.description}
                        onChange={handleChange}
                        name="description"
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
                    <Button onClick={handleSubmit}>Guardar</Button>
                  </Dialog.ActionTrigger>
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
