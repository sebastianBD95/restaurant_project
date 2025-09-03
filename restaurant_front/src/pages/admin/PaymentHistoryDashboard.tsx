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
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';

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
  const { isSidebarOpen, toggleSidebar, handleHomeClick } = useSidebar();

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

  const exportToCSV = () => {
    const filename = `historial_pagos_${dayjs().format('YYYY-MM-DD')}.csv`;
    exportPaymentHistoryToCSV(filteredPayments, filename);
  };

  const getPaymentMethodLabel = (method: string) => {
    const methodInfo = getPaymentMethods().find(m => m.value === method);
    return methodInfo ? methodInfo.label : method;
  };

  const getPaymentMethodColor = (method: string) => {
    const methodInfo = getPaymentMethods().find(m => m.value === method);
    return methodInfo ? methodInfo.color : 'gray';
  };

  if (loading) {
    return (
      <Box p={6}>
        <Text>Cargando historial de pagos...</Text>
      </Box>
    );
  }

  return (
    <Flex height="100vh" direction={{ base: 'column', md: 'row' }}>
      {/* Sidebar */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        restaurantId={restaurantId}
      />

      {/* Main Content */}
      <Box flex={1} p={6} bg="gray.50" minH="100vh" overflowY="auto">
        <VStack gap={6} align="stretch">
          {/* Header */}
          <Box>
            <Heading size="lg" mb={2}>
              📊 Dashboard de Historial de Pagos
            </Heading>
            <Text color="gray.600">
              Gestiona y analiza el historial de todos los pagos realizados
            </Text>
          </Box>

          {/* Filtros */}
          <Box p={4} bg="white" borderRadius="md" boxShadow="sm">
            <HStack gap={4} flexWrap="wrap">
              <Box>
                <Text fontWeight="bold" mb={2}>Filtro de Tiempo</Text>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    width: '200px'
                  }}
                >
                  {timeFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Método de Pago</Text>
                <select
                  value={paymentMethodFilter}
                  onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    width: '200px'
                  }}
                >
                  {paymentMethodOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Box>

              <Box ml="auto">
                <Button
                  colorScheme="blue"
                  onClick={exportToCSV}
                  size="sm"
                >
                  📥 Exportar CSV
                </Button>
              </Box>
            </HStack>
          </Box>

          {/* Estadísticas */}
          <HStack gap={6} flexWrap="wrap">
            <Box p={6} bg="white" borderRadius="md" boxShadow="sm" flex="1" minW="200px">
              <VStack align="center" gap={2}>
                <Text fontSize="sm" color="gray.600">Ingresos Totales</Text>
                <Text fontSize="3xl" fontWeight="bold" color="green.500">
                  ${stats.totalRevenue.toLocaleString('es-CO')}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  {filteredPayments.length} pagos procesados
                </Text>
              </VStack>
            </Box>

            <Box p={6} bg="white" borderRadius="md" boxShadow="sm" flex="1" minW="200px">
              <VStack align="center" gap={2}>
                <Text fontSize="sm" color="gray.600">Total de Pagos</Text>
                <Text fontSize="3xl" fontWeight="bold" color="blue.500">
                  {stats.totalPayments}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Transacciones realizadas
                </Text>
              </VStack>
            </Box>

            <Box p={6} bg="white" borderRadius="md" boxShadow="sm" flex="1" minW="200px">
              <VStack align="center" gap={2}>
                <Text fontSize="sm" color="gray.600">Pago Promedio</Text>
                <Text fontSize="3xl" fontWeight="bold" color="purple.500">
                  ${stats.averagePayment.toLocaleString('es-CO', { maximumFractionDigits: 0 })}
                </Text>
                <Text fontSize="sm" color="gray.500">
                  Por transacción
                </Text>
              </VStack>
            </Box>
          </HStack>

          {/* Distribución por método de pago */}
          <Box p={6} bg="white" borderRadius="md" boxShadow="sm">
            <Heading size="md" mb={4}>Distribución por Método de Pago</Heading>
            <HStack gap={4} flexWrap="wrap">
              {Object.entries(stats.paymentsByMethod).map(([method, count]) => (
                <Box key={method} textAlign="center" p={4} bg="gray.100" borderRadius="md" minW="120px">
                  <Text fontWeight="bold" color={`${getPaymentMethodColor(method)}.500`}>
                    {getPaymentMethodLabel(method)}
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {count}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    pagos
                  </Text>
                </Box>
              ))}
            </HStack>
          </Box>

          {/* Top mesas por ingresos */}
          {stats.topTables.length > 0 && (
            <Box p={6} bg="white" borderRadius="md" boxShadow="sm">
              <Heading size="md" mb={4}>Top 5 Mesas por Ingresos</Heading>
              <HStack gap={4} flexWrap="wrap">
                {stats.topTables.map((tableInfo) => (
                  <Box key={tableInfo.table} textAlign="center" p={4} bg="blue.50" borderRadius="md" minW="120px">
                    <Text fontWeight="bold" color="blue.600">
                      Mesa {tableInfo.table}
                    </Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.600">
                      ${tableInfo.revenue.toLocaleString('es-CO')}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      ingresos
                    </Text>
                  </Box>
                ))}
              </HStack>
            </Box>
          )}

          {/* Tabla de pagos */}
          <Box p={6} bg="white" borderRadius="md" boxShadow="sm">
            <Heading size="md" mb={4}>Historial Detallado de Pagos</Heading>
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
                <Text color="gray.500">
                  No se encontraron pagos con los filtros seleccionados
                </Text>
              </Box>
            )}
          </Box>
        </VStack>
      </Box>
    </Flex>
  );
};

export default PaymentHistoryDashboard;