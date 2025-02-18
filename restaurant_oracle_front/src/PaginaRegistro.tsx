import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Input, Button, VStack, Text, Link } from "@chakra-ui/react";

const Register: React.FC = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    idNumber: "",
    phone: "",
    companyName: "",
    nitNumber: "",
  });

  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!Object.values(formData).every((field) => field.trim() !== "")) {
      setMessage("Todos los campos son obligatorios.");
      return;
    }

    setMessage("Usuario registrado exitosamente.");
    
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
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
        <Text fontSize="2xl" fontWeight="bold" mb={4}>Registro</Text>
        {message && <Text color={message.includes("exitosamente") ? "green.500" : "red.500"}>{message}</Text>}
        
        <form onSubmit={handleSubmit}>
          <VStack >
            <Box width="100%">
              <Text fontWeight="bold">Nombre Completo</Text>
              <Input 
                type="text" 
                name="fullName" 
                placeholder="Ingrese su nombre completo" 
                value={formData.fullName} 
                onChange={handleChange} 
                required 
              />
            </Box>

            <Box width="100%">
              <Text fontWeight="bold">Correo Electrónico</Text>
              <Input 
                type="email" 
                name="email" 
                placeholder="Ingrese su correo" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </Box>

            <Box width="100%">
              <Text fontWeight="bold">Número de Cédula</Text>
              <Input 
                type="text" 
                name="idNumber" 
                placeholder="Ingrese su número de cédula" 
                value={formData.idNumber} 
                onChange={handleChange} 
                required 
              />
            </Box>

            <Box width="100%">
              <Text fontWeight="bold">Teléfono Celular</Text>
              <Input 
                type="tel" 
                name="phone" 
                placeholder="Ingrese su teléfono celular" 
                value={formData.phone} 
                onChange={handleChange} 
                required 
              />
            </Box>

            <Box width="100%">
              <Text fontWeight="bold">Nombre de la Empresa o Restaurante</Text>
              <Input 
                type="text" 
                name="companyName" 
                placeholder="Ingrese el nombre de la empresa" 
                value={formData.companyName} 
                onChange={handleChange} 
                required 
              />
            </Box>

            <Box width="100%">
              <Text fontWeight="bold">Número del NIT</Text>
              <Input 
                type="text" 
                name="nitNumber" 
                placeholder="Ingrese el número del NIT" 
                value={formData.nitNumber} 
                onChange={handleChange} 
                required 
              />
            </Box>

            <Button type="submit" colorScheme="green" width="full">
              Registrarse
            </Button>

            {/* Corrección del Botón para regresar a Login */}
            <Button as="a" onClick={() => navigate("/login")} colorScheme="blue">
              ¿Ya tienes una cuenta? Inicia sesión
            </Button>
          </VStack>
        </form>
      </Box>
    </Box>
  );
};

export default Register;
