import React from 'react';
import './App.css';
import { Box,Button, VStack, Stack ,EmptyState } from "@chakra-ui/react"
import { LuShoppingCart } from "react-icons/lu"
import { useNavigate } from "react-router-dom"; // 1️ Importamos useNavigate de react-router-dom

const MiComponente: React.FC = () => {
    const navigate = useNavigate(); // 2️ Creamos la instancia de navigate

    const handleClick = (): void => { // 3️ Definimos la función con su tipo de retorno
        navigate("/nueva-pagina"); // 4️ Redirigimos a otra página
    };
    const handleClick2 = (): void => { // 3️ Definimos la función con su tipo de retorno
        navigate("/Ordenes"); // 4️ Redirigimos a otra página
    };
    const handleClick3 = (): void => { // 3️ Definimos la función con su tipo de retorno
        navigate("/Historial"); // 4️ Redirigimos a otra página
    };
    const handleClick4 = (): void => { // 3️ Definimos la función con su tipo de retorno
        navigate("/Dashboard"); // 4️ Redirigimos a otra página
    };
    const handleClick5 = (): void => { // 3️ Definimos la función con su tipo de retorno
        navigate("/Inventario"); // 4️ Redirigimos a otra página
    };
    const handleClick6 = (): void => { // 3️ Definimos la función con su tipo de retorno
        navigate("/pagos"); // 4️ Redirigimos a otra página
    };
    return (
        <Box
            bgImage="url('background.jpg')"
            bgRepeat="no-repeat"
            bgSize="cover"
            minH="100vh"  // Responsive height
            w="100vw"
            display="flex"
            justifyContent="center"
            alignItems="center"
            px={4} // Adds padding for smaller screens
        >
            <Stack alignItems="center" gap={4} w="full" maxW={{ base: "250px", md: "350px",lg: "500px" }}>
                <EmptyState.Root size="lg" colorPalette="teal">
                    <EmptyState.Content>
                        <EmptyState.Indicator>
                            <LuShoppingCart />
                        </EmptyState.Indicator>
                        <VStack textAlign="center">
                            <EmptyState.Title>Your cart is empty</EmptyState.Title>
                            <EmptyState.Description>
                                Explore our products and add items to your cart
                            </EmptyState.Description>
                        </VStack>
                    </EmptyState.Content>
                </EmptyState.Root>

                {/* Responsive Button Stack */}
                <Stack
                    direction={{ base: "column", sm: "row" }} // Column on mobile, row on larger screens
                    gap={2}
                    w={{ base: "100%", sm: "80%", md: "500px" }} // Responsive width
                >
                    <Button color="orange" variant="subtle" size="md" flex={1} h="45px" onClick={handleClick}>
                        Menu
                    </Button>
                    <Button color="orange" variant="subtle" rounded="md" flex={1} h="45px" onClick={handleClick2}>
                        Ordenes
                    </Button>
                    
                    <Button color="orange" variant="subtle" rounded="md" flex={1} h="45px" onClick={handleClick4}>
                        Graficas
                    </Button>
                    <Button color="orange" variant="subtle" rounded="md" flex={1} h="45px" onClick={handleClick5}>
                        Inventario
                    </Button>
                    <Button color="orange" variant="subtle" rounded="md" flex={1} h="45px" onClick={handleClick6}>
                        Pagos
                    </Button>
                    
                </Stack>
            </Stack>
        </Box>
     
    );
};

export default MiComponente;
