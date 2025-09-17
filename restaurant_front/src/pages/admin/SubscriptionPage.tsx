import React, { useEffect, useState } from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { activateSubscription, getSubscriptionStatus, Subscription } from '../../services/subscriptionService';

const SubscriptionPage: React.FC = () => {
  const navigate = useNavigate();
  const [sub, setSub] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setError(null);
    try {
      const s = await getSubscriptionStatus();
      setSub(s);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'No subscription found');
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleActivate = async () => {
    setLoading(true);
    setError(null);
    try {
      const s = await activateSubscription();
      setSub(s);
      navigate(`/restaurantes`);
    } catch (e: any) {
      setError(e?.response?.data?.error || 'Activation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={8} maxW="600px" mx="auto">
      <Heading mb={4}>Suscripción Mensual</Heading>
      <Text mb={6}>Activa tu plan por $60 COP al mes para usar la aplicación.</Text>

      {error && <Text color="red.500" mb={4}>{error}</Text>}

      {sub && (
        <VStack align="start" mb={6} spacing={1}>
          <Text><b>Estado:</b> {sub.status}</Text>
          <Text><b>Periodo:</b> {new Date(sub.current_period_start).toLocaleDateString()} - {new Date(sub.current_period_end).toLocaleDateString()}</Text>
        </VStack>
      )}

      <Button colorScheme="blue" onClick={handleActivate} isLoading={loading}>
        Activar por $60 COP/mes
      </Button>
    </Box>
  );
};

export default SubscriptionPage;

