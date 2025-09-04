import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Input, Button, VStack, Text } from '@chakra-ui/react';
import { registerUser } from '../services/autheticationService';
import { UserData } from '../interfaces/autho';
import { toast } from 'sonner';

const Register: React.FC = () => {
  const [formData, setFormData] = useState<UserData>({
    name: '',
    email: '',
    idNumber: '',
    phone: '',
    companyName: '',
    nitNumber: '',
    password: '',
  });

  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!Object.values(formData).every((field) => field.trim() !== '')) {
      setMessage('Todos los campos son obligatorios.');
      return;
    }
    try {
      await registerUser(formData);
      toast.success('Usuario registrado exitosamente');
      navigate('/restaurantes');
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'An error occurred');
      navigate('/');
    }
  };

  return (
    <div className="page-wrapper">
      <Box
        bgImage="url('background.jpg')"
        bgRepeat="no-repeat"
        bgSize="cover"
        minH="100vh"
        w="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
        px={{ base: 4, md: 6, lg: 8 }}
      >
        <Box
          bg="white"
          p={{ base: 6, md: 8, lg: 10 }}
          borderRadius={{ base: 'md', md: 'lg' }}
          boxShadow={{ base: 'md', md: 'lg', lg: 'xl' }}
          width={{ base: '95%', sm: '90%', md: '400px', lg: '450px' }}
          textAlign="center"
          mx={{ base: 2, md: 4 }}
        >
          <Text 
            fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} 
            fontWeight="bold" 
            mb={{ base: 3, md: 4, lg: 6 }}
          >
            Registro
          </Text>
          {message && (
            <Text 
              color={message.includes('exitosamente') ? 'green.500' : 'red.500'}
              fontSize={{ base: 'sm', md: 'md' }}
              mb={{ base: 2, md: 3 }}
            >
              {message}
            </Text>
          )}

          <form onSubmit={handleSubmit}>
            <VStack spacing={{ base: 3, md: 4, lg: 5 }}>
              <Box width="100%">
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: 'sm', md: 'md' }}
                  mb={{ base: 1, md: 2 }}
                  textAlign="left"
                >
                  Nombre Completo
                </Text>
                <Input
                  type="text"
                  name="name"
                  placeholder="Ingrese su nombre completo"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  size={{ base: 'md', md: 'lg' }}
                  fontSize={{ base: 'sm', md: 'md' }}
                />
              </Box>

              <Box width="100%">
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: 'sm', md: 'md' }}
                  mb={{ base: 1, md: 2 }}
                  textAlign="left"
                >
                  Correo Electrónico
                </Text>
                <Input
                  type="email"
                  name="email"
                  placeholder="Ingrese su correo"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  size={{ base: 'md', md: 'lg' }}
                  fontSize={{ base: 'sm', md: 'md' }}
                />
              </Box>

              <Box width="100%">
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: 'sm', md: 'md' }}
                  mb={{ base: 1, md: 2 }}
                  textAlign="left"
                >
                  Número de Cédula
                </Text>
                <Input
                  type="text"
                  name="idNumber"
                  placeholder="Ingrese su número de cédula"
                  value={formData.idNumber}
                  onChange={handleChange}
                  required
                  size={{ base: 'md', md: 'lg' }}
                  fontSize={{ base: 'sm', md: 'md' }}
                />
              </Box>

              <Box width="100%">
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: 'sm', md: 'md' }}
                  mb={{ base: 1, md: 2 }}
                  textAlign="left"
                >
                  Teléfono Celular
                </Text>
                <Input
                  type="tel"
                  name="phone"
                  placeholder="Ingrese su teléfono celular"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  size={{ base: 'md', md: 'lg' }}
                  fontSize={{ base: 'sm', md: 'md' }}
                />
              </Box>

              <Box width="100%">
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: 'sm', md: 'md' }}
                  mb={{ base: 1, md: 2 }}
                  textAlign="left"
                >
                  Nombre de la Empresa o Restaurante
                </Text>
                <Input
                  type="text"
                  name="companyName"
                  placeholder="Ingrese el nombre de la empresa"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  size={{ base: 'md', md: 'lg' }}
                  fontSize={{ base: 'sm', md: 'md' }}
                />
              </Box>

              <Box width="100%">
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: 'sm', md: 'md' }}
                  mb={{ base: 1, md: 2 }}
                  textAlign="left"
                >
                  Número del NIT
                </Text>
                <Input
                  type="text"
                  name="nitNumber"
                  placeholder="Ingrese el número del NIT"
                  value={formData.nitNumber}
                  onChange={handleChange}
                  required
                  size={{ base: 'md', md: 'lg' }}
                  fontSize={{ base: 'sm', md: 'md' }}
                />
              </Box>

              <Box width="100%">
                <Text 
                  fontWeight="bold" 
                  fontSize={{ base: 'sm', md: 'md' }}
                  mb={{ base: 1, md: 2 }}
                  textAlign="left"
                >
                  Contraseña
                </Text>
                <Input
                  type="password"
                  name="password"
                  placeholder="Ingrese su contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  size={{ base: 'md', md: 'lg' }}
                  fontSize={{ base: 'sm', md: 'md' }}
                />
              </Box>

              <Button 
                type="submit" 
                colorScheme="green" 
                width="full"
                size={{ base: 'md', md: 'lg' }}
                fontSize={{ base: 'sm', md: 'md' }}
                py={{ base: 2, md: 3 }}
              >
                Registrarse
              </Button>

              {/* Corrección del Botón para regresar a Login */}
              <Button 
                as="a" 
                onClick={() => navigate('/')} 
                colorScheme="blue"
                size={{ base: 'md', md: 'lg' }}
                fontSize={{ base: 'sm', md: 'md' }}
                py={{ base: 2, md: 3 }}
              >
                ¿Ya tienes una cuenta? Inicia sesión
              </Button>
            </VStack>
          </form>
        </Box>
      </Box>
    </div>
  );
};

export default Register;
