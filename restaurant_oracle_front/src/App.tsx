import React from 'react';
import MiComponente from './PaginaInicio';
import PaginaMenu from './paginaMenu';
import LogIn from './PaginaLogIn';
import PaginaRegistro from './PaginaRegistro';

import './App.css';
import { Box,Button, VStack,Stack, ChakraProvider , defaultSystem ,EmptyState } from "@chakra-ui/react"
import { LuShoppingCart } from "react-icons/lu"
import { useNavigate, BrowserRouter as Router, Routes, Route } from "react-router-dom";



function App() {

  return (
    <ChakraProvider value={defaultSystem} >
        <Router>
            <Routes>
                <Route path="/" element={<LogIn />} />
                <Route path="/pagina1" element={<MiComponente />} />
                <Route path="/nueva-pagina" element={<PaginaMenu />} />
                <Route path="/Registro" element={<PaginaRegistro />} />

            </Routes>
        </Router>
    </ChakraProvider>
    
  );
}


export default App;
