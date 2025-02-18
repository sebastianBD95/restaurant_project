import React from 'react';
import './App.css';
import { Box,Button, VStack,Stack, ChakraProvider , defaultSystem ,EmptyState } from "@chakra-ui/react"
import { LuShoppingCart } from "react-icons/lu"


function App() {
  return (
    <ChakraProvider value={defaultSystem} >
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
                    <Button color="orange" variant="subtle" size="md" flex={1} h="45px">
                        Menu
                    </Button>
                    <Button color="orange" variant="subtle" rounded="md" flex={1} h="45px">
                        Pay
                    </Button>
                </Stack>
            </Stack>
        </Box>
    </ChakraProvider>
  );
}

export default App;
