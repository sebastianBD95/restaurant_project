import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useSidebar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleHomeClick = (): void => {
    navigate('/restaurantes');
  };

  return {
    isSidebarOpen,
    toggleSidebar,
    handleHomeClick,
  };
};
