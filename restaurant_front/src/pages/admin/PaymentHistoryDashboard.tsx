'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, VStack, HStack, Text, Button, Flex } from '@chakra-ui/react';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { 
  getPaymentHistory, 
  getPaymentStats, 
  exportPaymentHistoryToCSV,
  getPaymentMethods,
  getTimeFilterOptions,
  PaymentRecord,
  PaymentFilters
} from '../../services/paymentHistoryService';
import { ResponsiveSidebar } from '../../components/ui/ResponsiveSidebar';
import { useResponsive } from '../../hooks/useResponsive';

interface PaymentStats {
  totalRevenue: number;
  totalPayments: number;
  averagePayment: number;
  paymentsByMethod: Record<string, number>;
  paymentsByMonth: Record<string, number>;
  topTables: Array<{ table: number; revenue: number }>;
}

const PaymentHistoryDashboard: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<PaymentRecord[]>([]);
  const [stats, setStats] = useState<PaymentStats>({
    totalRevenue: 0,
    totalPayments: 0,
    averagePayment: 0,
    paymentsByMethod: {},
    paymentsByMonth: {},
    topTables: [],
  });
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('month');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const { restaurantId } = useParams();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  // Opciones de filtro de tiempo
  const timeFilterOptions = getTimeFilterOptions();

  // Opciones de filtro de método de pago
  const paymentMethodOptions = [
    { value: 'all', label: 'Todos los métodos' },
    ...getPaymentMethods()
  ];

  useEffect(() => {
    fetchPayments();
  }, [restaurantId]);

  useEffect(() => {
    applyFilters();
  }, [payments, timeFilter, paymentMethodFilter]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      if (!restaurantId) return;

      const filters: PaymentFilters = {
        timeFilter: timeFilter as any,
        paymentMethod: paymentMethodFilter,
      };

      const paymentRecords = await getPaymentHistory(restaurantId, filters);
      setPayments(paymentRecords);
    } catch (error) {
      toast.error('Error al cargar el historial de pagos');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = async () => {
    if (!restaurantId) return;

    try {
      const filters: PaymentFilters = {
        timeFilter: timeFilter as any,
        paymentMethod: paymentMethodFilter,
      };

      const paymentRecords = await getPaymentHistory(restaurantId, filters);
      setFilteredPayments(paymentRecords);
      
      // Obtener estadísticas
      const paymentStats = await getPaymentStats(restaurantId, filters);
      setStats(paymentStats);
    } catch (error) {
      toast.error('Error al aplicar filtros');
    }
  };

  const handleExport = async () => {
    try {
      if (!restaurantId) return;

      const filters: PaymentFilters = {
        timeFilter: timeFilter as any,
        paymentMethod: paymentMethodFilter,
      };

      await exportPaymentHistoryToCSV(restaurantId, filters);
      toast.success('Historial exportado exitosamente');
    } catch (error) {
      toast.error('Error al exportar el historial');
    }
  };

  const getPaymentMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      efectivo: 'green',
      tarjeta: 'blue',
      transferencia: 'purple',
      otro: 'gray',
    };
    return colors[method] || 'gray';
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      efectivo: 'Efectivo',
      tarjeta: 'Tarjeta',
      transferencia: 'Transferencia',
      otro: 'Otro',
    };
    return labels[method] || 'Otro';
  };

  if (loading) {
    return (
      <div className="page-wrapper">
        <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
          <ResponsiveSidebar restaurantId={restaurantId} />
          <Box 
            flex={1} 
            p={{ base: 2, sm: 3, md: 4, lg: 6 }} 
            overflowY="auto"
            ml={{ base: 0, md: 0 }}
          >
            <Box 
              p={{ base: 3, sm: 4, md: 6, lg: 8 }} 
              bg="gray.100" 
              minH="100vh"
              borderRadius={{ base: 'none', md: 'md' }}
            >
              <VStack spacing={4} align="stretch">
                <Box textAlign="center" py={8}>
                  <Text fontSize={{ base: 'lg', md: 'xl' }}>Cargando...</Text>
                </Box>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
        <ResponsiveSidebar restaurantId={restaurantId} />
        <Box 
          flex={1} 
          p={{ base: 2, sm: 3, md: 4, lg: 6 }} 
          overflowY="auto"
          ml={{ base: 0, md: 0 }}
        >
          <Box 
            p={{ base: 3, sm: 4, md: 6, lg: 8 }} 
            bg="gray.100" 
            minH="100vh"
            borderRadius={{ base: 'none', md: 'md' }}
          >
            <VStack spacing={{ base: 4, md: 6, lg: 8 }} align="stretch">
              {/* Header */}
              <Box>
                <Heading 
                  size={{ base: 'lg', md: 'xl', lg: '2xl' }}
                  mb={{ base: 3, md: 4, lg: 6 }}
                  color="gray.800"
                  textAlign={{ base: 'center', md: 'left' }}
                >
                  📊 Historial de Pagos
                </Heading>
                <Text 
                  color="gray.600"
                  fontSize={{ base: 'sm', md: 'md' }}
                  textAlign={{ base: 'center', md: 'left' }}
                >
                  Analiza y gestiona el historial de pagos de tu restaurante
                </Text>
              </Box>

              {/* Stats Cards */}
              <Box>
                <Heading 
                  size={{ base: 'md', md: 'lg' }}
                  mb={{ base: 3, md: 4, lg: 6 }}
                  color="gray.700"
                >
                  Resumen de Estadísticas
                </Heading>
                <Box 
                  display="grid"
                  gridTemplateColumns={{
                    base: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                    lg: 'repeat(4, 1fr)'
                  }}
                  gap={{ base: 3, md: 4, lg: 6 }}
                >
                  <Box 
                    p={{ base: 3, md: 4, lg: 6 }}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                        Ingresos Totales
                      </Text>
                      <Text 
                        fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                        fontWeight="bold"
                        color="green.600"
                      >
                        ${stats.totalRevenue.toLocaleString('es-CO')}
                      </Text>
                    </VStack>
                  </Box>

                  <Box 
                    p={{ base: 3, md: 4, lg: 6 }}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                        Total de Pagos
                      </Text>
                      <Text 
                        fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                        fontWeight="bold"
                        color="blue.600"
                      >
                        {stats.totalPayments}
                      </Text>
                    </VStack>
                  </Box>

                  <Box 
                    p={{ base: 3, md: 4, lg: 6 }}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                        Pago Promedio
                      </Text>
                      <Text 
                        fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                        fontWeight="bold"
                        color="purple.600"
                      >
                        ${stats.averagePayment.toLocaleString('es-CO')}
                      </Text>
                    </VStack>
                  </Box>

                  <Box 
                    p={{ base: 3, md: 4, lg: 6 }}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="sm"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <VStack align="start" spacing={2}>
                      <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600">
                        Mesas Activas
                      </Text>
                      <Text 
                        fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }}
                        fontWeight="bold"
                        color="orange.600"
                      >
                        {stats.topTables.length}
                      </Text>
                    </VStack>
                  </Box>
                </Box>
              </Box>

              {/* Filters */}
              <Box>
                <Heading 
                  size={{ base: 'md', md: 'lg' }}
                  mb={{ base: 3, md: 4, lg: 6 }}
                  color="gray.700"
                >
                  Filtros
                </Heading>
                <Box 
                  bg="white"
                  p={{ base: 3, md: 4, lg: 6 }}
                  borderRadius="lg"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <VStack spacing={{ base: 3, md: 4, lg: 6 }} align="stretch">
                    <HStack 
                      spacing={{ base: 2, md: 4, lg: 6 }}
                      flexDir={{ base: 'column', sm: 'row' }}
                      align={{ base: 'stretch', sm: 'center' }}
                    >
                      <Box flex={1}>
                        <Text 
                          mb={2}
                          fontSize={{ base: 'sm', md: 'md' }}
                          fontWeight="medium"
                          color="gray.700"
                        >
                          Período de Tiempo
                        </Text>
                        <select
                          value={timeFilter}
                          onChange={(e) => setTimeFilter(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px'
                          }}
                        >
                          {timeFilterOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Box>

                      <Box flex={1}>
                        <Text 
                          mb={2}
                          fontSize={{ base: 'sm', md: 'md' }}
                          fontWeight="medium"
                          color="gray.700"
                        >
                          Método de Pago
                        </Text>
                        <select
                          value={paymentMethodFilter}
                          onChange={(e) => setPaymentMethodFilter(e.target.value)}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            fontSize: '14px'
                          }}
                        >
                          {paymentMethodOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </Box>
                    </HStack>

                    <HStack 
                      spacing={{ base: 2, md: 4, lg: 6 }}
                      justify={{ base: 'center', sm: 'flex-start' }}
                    >
                      <Button
                        colorScheme="blue"
                        onClick={applyFilters}
                        size={{ base: 'sm', md: 'md', lg: 'lg' }}
                        fontSize={{ base: 'sm', md: 'md' }}
                        width={{ base: 'full', sm: 'auto' }}
                      >
                        Aplicar Filtros
                      </Button>
                      <Button
                        colorScheme="green"
                        onClick={handleExport}
                        size={{ base: 'sm', md: 'md', lg: 'lg' }}
                        fontSize={{ base: 'sm', md: 'md' }}
                        width={{ base: 'full', sm: 'auto' }}
                      >
                        Exportar CSV
                      </Button>
                    </HStack>
                  </VStack>
                </Box>
              </Box>

              {/* Payment History Table */}
              <Box>
                <Heading 
                  size={{ base: 'md', md: 'lg' }}
                  mb={{ base: 3, md: 4, lg: 6 }}
                  color="gray.700"
                >
                  Historial de Pagos
                </Heading>
                <Box 
                  bg="white"
                  p={{ base: 3, md: 4, lg: 6 }}
                  borderRadius="lg"
                  boxShadow="sm"
                  borderWidth="1px"
                  borderColor="gray.200"
                  overflowX="auto"
                >
                  <Box overflowX="auto">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Fecha y Hora</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Mesa</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Total</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Método de Pago</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Cliente</th>
                          <th style={{ padding: '12px', textAlign: 'left', fontWeight: 'bold' }}>Estado</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredPayments.map((payment) => (
                          <tr key={payment.order_id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px' }}>
                              <Text fontSize="sm">
                                {dayjs(payment.created_at).format('DD/MM/YYYY')}
                              </Text>
                              <Text fontSize="xs" color="gray.500">
                                {dayjs(payment.created_at).format('HH:mm')}
                              </Text>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <Box
                                as="span"
                                px={2}
                                py={1}
                                bg="blue.100"
                                color="blue.800"
                                borderRadius="md"
                                fontSize="sm"
                              >
                                Mesa {payment.table}
                              </Box>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <Text fontWeight="bold" color="green.600">
                                ${payment.total_price.toLocaleString('es-CO')}
                              </Text>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <Box
                                as="span"
                                px={2}
                                py={1}
                                bg={`${getPaymentMethodColor(payment.payment_method || 'efectivo')}.100`}
                                color={`${getPaymentMethodColor(payment.payment_method || 'efectivo')}.800`}
                                borderRadius="md"
                                fontSize="sm"
                              >
                                {getPaymentMethodLabel(payment.payment_method || 'efectivo')}
                              </Box>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <VStack align="start" gap={1}>
                                <Text fontSize="sm" fontWeight="medium">
                                  {payment.customer_name || 'Sin nombre'}
                                </Text>
                                {payment.customer_id && (
                                  <Text fontSize="xs" color="gray.500">
                                    ID: {payment.customer_id}
                                  </Text>
                                )}
                              </VStack>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <Box
                                as="span"
                                px={2}
                                py={1}
                                bg="green.100"
                                color="green.800"
                                borderRadius="md"
                                fontSize="sm"
                              >
                                Pagado
                              </Box>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </Box>

                  {filteredPayments.length === 0 && (
                    <Box textAlign="center" py={8}>
                      <Text 
                        color="gray.500"
                        fontSize={{ base: 'sm', md: 'md' }}
                      >
                        No se encontraron pagos con los filtros seleccionados
                      </Text>
                    </Box>
                  )}
                </Box>
              </Box>
            </VStack>
          </Box>
        </Box>
      </Flex>
    </div>
  );
};

export default PaymentHistoryDashboard;