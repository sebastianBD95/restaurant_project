import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Input, Button, VStack, Text } from '@chakra-ui/react';
import { loginUser } from '../services/autheticationService';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Manejo del cambio en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  function getCookie(name: string): string | null {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
    return null;
  }

  // Manejo del envío del formulario
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError('Por favor, completa ambos campos.');
      return;
    }
    setError(null);
    try {
      const data = await loginUser(formData.username, formData.password);
      document.cookie = `token=${data.token}; Secure; SameSite=Strict; Path=/`;
      document.cookie = `role=${data.role}; Secure; SameSite=Strict; Path=/`;

      console.log(getCookie('role'));
      console.log(getCookie('token'));
      navigate('/restaurantes');
    } catch (error: any) {
      setError(error.message);
      navigate('/');
    }
  };

  return (
    <div>
      <Box
        bgImage="url('background.jpg')"
        bgRepeat="no-repeat"
        bgSize="cover"
        minH="100vh"
        w="100vw"
        display="flex"
        justifyContent="center"
        alignItems="center"
        px={4}
      >
        <Box
          bg="white"
          p={8}
          borderRadius="md"
          boxShadow="lg"
          width={{ base: '90%', md: '400px' }}
          textAlign="center"
        >
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Iniciar Sesión
          </Text>
          {error && <Text color="red.500">{error}</Text>}
          <form onSubmit={handleSubmit}>
            <VStack>
              {/* Usuario */}
              <Box width="100%">
                <Text fontWeight="bold">Usuario</Text>
                <Input
                  type="text"
                  name="username"
                  placeholder="Ingrese su usuario"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </Box>

              {/* Contraseña */}
              <Box width="100%">
                <Text fontWeight="bold">Contraseña</Text>
                <Input
                  type="password"
                  name="password"
                  placeholder="Ingrese su contraseña"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </Box>

              <Button type="submit" colorScheme="blue" width="full">
                Iniciar Sesión
              </Button>

              <Button colorScheme="teal" width="full" onClick={() => navigate('/Registro')}>
                Registrarse
              </Button>
            </VStack>
          </form>
        </Box>
      </Box>
    </div>
  );
};

// Componente principal de Login
const LogIn: React.FC = () => {
  const [authorized, setAuthorized] = useState<boolean>(false);
  const navigate = useNavigate();

  return <>{!authorized ? <LoginForm /> : null}</>;
};

export default LogIn;
