import React from 'react';
import { Box, Text, CloseButton, Portal } from '@chakra-ui/react';

interface ToastProps {
  title: string;
  description: string;
  status: 'success' | 'error';
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ title, description, status, onClose }) => {
  const bgColor = status === 'success' ? 'green.500' : 'red.500';

  return (
    <Portal>
      <Box
        position="fixed"
        top={4}
        right={4}
        zIndex={9999}
        bg={bgColor}
        color="white"
        p={4}
        borderRadius="md"
        boxShadow="lg"
        maxW="sm"
      >
        <CloseButton position="absolute" right={2} top={2} onClick={onClose} />
        <Text fontWeight="bold" mb={1}>
          {title}
        </Text>
        <Text>{description}</Text>
      </Box>
    </Portal>
  );
};

export const useToast = () => {
  const [isVisible, setIsVisible] = React.useState(false);
  const [toastProps, setToastProps] = React.useState<Omit<ToastProps, 'onClose'> | null>(null);

  const showToast = (props: Omit<ToastProps, 'onClose'>) => {
    setToastProps(props);
    setIsVisible(true);
    setTimeout(() => {
      setIsVisible(false);
    }, 5000);
  };

  const ToastComponent = () => {
    if (!isVisible || !toastProps) return null;
    return <Toast {...toastProps} onClose={() => setIsVisible(false)} />;
  };

  return {
    showToast,
    ToastComponent,
  };
};
