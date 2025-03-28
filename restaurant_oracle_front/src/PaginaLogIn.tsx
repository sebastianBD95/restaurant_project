import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Input, Button, VStack, Text } from "@chakra-ui/react";


// Componente reutilizable para el formulario de inicio de sesión
const LoginForm: React.FC<{ onLogin: (username: string, password: string) => void }> = ({ onLogin }) => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  // Manejo del cambio en los inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Manejo del envío del formulario
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.username || !formData.password) {
      setError("Por favor, completa ambos campos.");
      return;
    }
    setError(null);
    onLogin(formData.username, formData.password);
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
        width={{ base: "90%", md: "400px" }} 
        textAlign="center"
      >
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Iniciar Sesión</Text>
        {error && <Text color="red.500">{error}</Text>}
        <form onSubmit={handleSubmit}>
          <VStack >
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
            
            <Button colorScheme="teal" width="full" onClick={() => navigate("/Registro")}>
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
  const validCredentials = {
    username: "Laura",
    password: "hola"
  };

  const [authorized, setAuthorized] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleLogin = (enteredUsername: string, enteredPassword: string) => {
    if (
      enteredUsername === validCredentials.username &&
      enteredPassword === validCredentials.password
    ) {
      setAuthorized(true);
      navigate("/pagina1", { replace: true }); // Redirigir al usuario a la página de inicio
    } else {
      alert("Usuario o contraseña incorrectos"); // Puedes mejorar esto con un estado de error
    }
  };

  return <>{!authorized ? <LoginForm onLogin={handleLogin} /> : null}</>;
};

export default LogIn;

 