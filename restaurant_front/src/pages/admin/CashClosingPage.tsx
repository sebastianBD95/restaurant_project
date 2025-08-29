import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Grid,
  GridItem,
  Spinner,
  Badge,
  Flex,
  Table,
  Image,
  Container,
  NativeSelect,
  Divider,
  Card,
  CardHeader,
  CardBody,
} from '@chakra-ui/react';
import { useParams } from 'react-router-dom';
import { Sidebar } from '../../components/ui/navegator';
import { useSidebar } from '../../hooks/useSidebar';
import { Toaster, toaster } from '../../components/ui/toaster';
import { CustomField } from '../../components/ui/field';
import { NumberInputRoot, NumberInputField } from '../../components/ui/number-input';
import { getCookie } from '../utils/cookieManager';
import { getCashClosingData, performCashClosing, CashClosingData, CashClosingRequest } from '../../services/cashClosingService';

const CashClosingPage: React.FC = () => {
  const { restaurantId } = useParams<{ restaurantId: string }>();
  const { isSidebarOpen, toggleSidebar } = useSidebar();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [cashClosingData, setCashClosingData] = useState<CashClosingData | null>(null);
  const [cashInRegister, setCashInRegister] = useState<number>(0);
  const [cashWithdrawn, setCashWithdrawn] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [isClosing, setIsClosing] = useState(false);

  // Colombian Peso formatter
  const copFormatter = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // Memoize fetchCashClosingData to prevent unnecessary re-renders
  const fetchCashClosingData = useCallback(async () => {
    if (!restaurantId) return;
    
    setIsLoading(true);
    setError('');
    try {
      const token = getCookie(document.cookie, 'token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const data = await getCashClosingData(token, restaurantId, selectedDate);
      setCashClosingData(data);
      setCashInRegister(data.cashInRegister);
      setCashWithdrawn(data.cashWithdrawn);
      setNotes(data.notes);
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error cargando datos de cierre de caja.',
        type: 'error',
        duration: 5000,
      });
      setError('Error loading cash closing data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId, selectedDate]);

  // Load data on mount and when restaurantId changes
  useEffect(() => {
    fetchCashClosingData();
  }, [fetchCashClosingData]);

  // Show error as a toast notification when error changes
  useEffect(() => {
    if (error) {
      toaster.create({
        title: 'Error',
        description: error,
        type: 'error',
        duration: 5000,
      });
    }
  }, [error]);

  // Handle date change with debouncing
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Prevent any default behavior
    const newDate = e.target.value;
    setSelectedDate(newDate);
  };

  const handleCashClosing = async () => {
    if (!cashClosingData || !restaurantId) return;

    setIsClosing(true);
    try {
      const token = getCookie(document.cookie, 'token');
      if (!token) {
        setError('No authentication token found');
        return;
      }

      const cashClosingRequest: CashClosingRequest = {
        date: selectedDate,
        cashInRegister,
        cashWithdrawn,
        notes,
        totalSales: cashClosingData.totalSales,
        totalRevenue: cashClosingData.totalRevenue,
        totalCosts: cashClosingData.totalCosts,
        totalProfit: cashClosingData.totalProfit,
        orderCount: cashClosingData.orderCount,
        averageOrderValue: cashClosingData.averageOrderValue,
      };

      await performCashClosing(token, restaurantId, cashClosingRequest);

      toaster.create({
        title: 'Cierre de caja completado',
        description: `Cierre de caja realizado exitosamente para ${selectedDate}`,
        type: 'success',
        duration: 5000,
      });

      // Refresh data after successful closing
      await fetchCashClosingData();
      
    } catch (error) {
      toaster.create({
        title: 'Error',
        description: 'Error al realizar el cierre de caja.',
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsClosing(false);
    }
  };

  const generateReport = () => {
    if (!cashClosingData) return;

    const report = `
Cierre de Caja - ${selectedDate}
=====================================
Ventas Totales: ${copFormatter.format(cashClosingData.totalSales)}
Ingresos: ${copFormatter.format(cashClosingData.totalRevenue)}
Costos: ${copFormatter.format(cashClosingData.totalCosts)}
Ganancias: ${copFormatter.format(cashClosingData.totalProfit)}
Número de Pedidos: ${cashClosingData.orderCount}
Valor Promedio por Pedido: ${copFormatter.format(cashClosingData.averageOrderValue)}

Efectivo en Caja: ${copFormatter.format(cashInRegister)}
Efectivo Retirado: ${copFormatter.format(cashWithdrawn)}
Balance: ${copFormatter.format(cashInRegister - cashWithdrawn)}

Notas: ${notes}
    `;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cierre-caja-${selectedDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toaster.create({
      title: 'Reporte generado',
      description: 'Reporte de cierre de caja descargado exitosamente.',
      type: 'success',
      duration: 3000,
    });
  };

  if (isLoading) {
    return (
      <Flex height="100vh" direction={{ base: "column", md: "row" }}>
        <Sidebar 
          isSidebarOpen={isSidebarOpen} 
          toggleSidebar={toggleSidebar} 
          restaurantId={restaurantId}
        />
        <Box flex={1} display="flex" justifyContent="center" alignItems="center">
          <Spinner size="xl" />
        </Box>
      </Flex>
    );
  }

  return (
    <Flex height="100vh" direction={{ base: "column", md: "row" }}>
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        restaurantId={restaurantId}
      />

      <Box flex={1} p={{ base: 4, md: 8 }} overflowY="auto" bg="gray.50">
        <Container maxW="container.xl">
          <VStack gap={6} align="stretch">
            <Heading 
              textAlign="center" 
              size="2xl" 
              color="gray.800"
              mb={4}
            >
              💰 Cierre de Caja
            </Heading>

            <Text 
              textAlign="center" 
              fontSize="lg" 
              color="gray.600"
              mb={6}
            >
              Balance diario de ventas, ingresos, costos y ganancias del restaurante.
            </Text>

            {/* Date Selection */}
            <Box bg="white" borderRadius="md" boxShadow="md" p={4}>
              <CustomField label="Fecha de cierre">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    fontSize: '14px'
                  }}
                />
              </CustomField>
            </Box>

            {cashClosingData ? (
              <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
                {/* Left Column - Summary and Details */}
                <GridItem>
                  <VStack gap={6} align="stretch">
                    {/* Financial Summary */}
                    <Box bg="white" borderRadius="md" boxShadow="md">
                      <Box p={4} borderBottom="1px solid #e2e8f0">
                        <Heading size="lg">Resumen Financiero</Heading>
                      </Box>
                      <Box p={4}>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <Box p={4} bg="blue.50" borderRadius="md">
                            <Text fontSize="sm" color="blue.600" fontWeight="medium">Ventas Totales</Text>
                            <Text fontSize="xl" fontWeight="bold" color="blue.700">
                              {copFormatter.format(cashClosingData.totalSales)}
                            </Text>
                          </Box>
                          <Box p={4} bg="green.50" borderRadius="md">
                            <Text fontSize="sm" color="green.600" fontWeight="medium">Ingresos</Text>
                            <Text fontSize="xl" fontWeight="bold" color="green.700">
                              {copFormatter.format(cashClosingData.totalRevenue)}
                            </Text>
                          </Box>
                          <Box p={4} bg="red.50" borderRadius="md">
                            <Text fontSize="sm" color="red.600" fontWeight="medium">Costos</Text>
                            <Text fontSize="xl" fontWeight="bold" color="red.700">
                              {copFormatter.format(cashClosingData.totalCosts)}
                            </Text>
                          </Box>
                          <Box p={4} bg="purple.50" borderRadius="md">
                            <Text fontSize="sm" color="purple.600" fontWeight="medium">Ganancias</Text>
                            <Text fontSize="xl" fontWeight="bold" color="purple.700">
                              {copFormatter.format(cashClosingData.totalProfit)}
                            </Text>
                          </Box>
                        </Grid>
                      </Box>
                    </Box>

                    {/* Order Statistics */}
                    <Box bg="white" borderRadius="md" boxShadow="md">
                      <Box p={4} borderBottom="1px solid #e2e8f0">
                        <Heading size="lg">Estadísticas de Pedidos</Heading>
                      </Box>
                      <Box p={4}>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <Box textAlign="center" p={4}>
                            <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                              {cashClosingData.orderCount}
                            </Text>
                            <Text fontSize="sm" color="gray.600">Total de Pedidos</Text>
                          </Box>
                          <Box textAlign="center" p={4}>
                            <Text fontSize="2xl" fontWeight="bold" color="green.600">
                              {copFormatter.format(cashClosingData.averageOrderValue)}
                            </Text>
                            <Text fontSize="sm" color="gray.600">Promedio por Pedido</Text>
                          </Box>
                        </Grid>
                      </Box>
                    </Box>

                    {/* Top Selling Items */}
                    {cashClosingData.topSellingItems.length > 0 && (
                      <Box bg="white" borderRadius="md" boxShadow="md">
                        <Box p={4} borderBottom="1px solid #e2e8f0">
                          <Heading size="lg">Platos Más Vendidos</Heading>
                        </Box>
                        <Box p={4}>
                          <Table.Root size="sm">
                            <Table.Header>
                              <Table.Row>
                                <Table.ColumnHeader>Plato</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="center">Cantidad</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right">Ingresos</Table.ColumnHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {cashClosingData.topSellingItems.map((item, index) => (
                                <Table.Row key={index}>
                                  <Table.Cell>
                                    <HStack>
                                      <Badge colorScheme="blue" fontSize="0.8em">
                                        #{index + 1}
                                      </Badge>
                                      <Text>{item.name}</Text>
                                    </HStack>
                                  </Table.Cell>
                                  <Table.Cell textAlign="center">{item.quantity}</Table.Cell>
                                  <Table.Cell textAlign="right">
                                    {copFormatter.format(item.revenue)}
                                  </Table.Cell>
                                </Table.Row>
                              ))}
                            </Table.Body>
                          </Table.Root>
                        </Box>
                      </Box>
                    )}

                    {/* Payment Methods */}
                    {cashClosingData.paymentMethods.length > 0 && (
                      <Box bg="white" borderRadius="md" boxShadow="md">
                        <Box p={4} borderBottom="1px solid #e2e8f0">
                          <Heading size="lg">Métodos de Pago</Heading>
                        </Box>
                        <Box p={4}>
                          <Table.Root size="sm">
                            <Table.Header>
                              <Table.Row>
                                <Table.ColumnHeader>Método</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="center">Transacciones</Table.ColumnHeader>
                                <Table.ColumnHeader textAlign="right">Monto</Table.ColumnHeader>
                              </Table.Row>
                            </Table.Header>
                            <Table.Body>
                              {cashClosingData.paymentMethods.map((method, index) => (
                                <Table.Row key={index}>
                                  <Table.Cell>
                                    <Badge colorScheme="green" fontSize="0.8em">
                                      {method.method}
                                    </Badge>
                                  </Table.Cell>
                                  <Table.Cell textAlign="center">{method.count}</Table.Cell>
                                  <Table.Cell textAlign="right">
                                    {copFormatter.format(method.amount)}
                                  </Table.Cell>
                                </Table.Row>
                              ))}
                            </Table.Body>
                          </Table.Root>
                        </Box>
                      </Box>
                    )}
                  </VStack>
                </GridItem>

                {/* Right Column - Cash Closing Form */}
                <GridItem>
                  <Box bg="white" borderRadius="md" boxShadow="md">
                    <Box p={4} borderBottom="1px solid #e2e8f0">
                      <Heading size="lg">Cierre de Caja</Heading>
                    </Box>
                    <Box p={4}>
                      <VStack gap={4} align="stretch">
                        <CustomField label="Efectivo en Caja">
                          <NumberInputRoot
                            value={String(cashInRegister)}
                            onValueChange={({ value }) => setCashInRegister(Number(value) || 0)}
                            min={0}
                          >
                            <NumberInputField />
                          </NumberInputRoot>
                        </CustomField>

                        <CustomField label="Efectivo Retirado">
                          <NumberInputRoot
                            value={String(cashWithdrawn)}
                            onValueChange={({ value }) => setCashWithdrawn(Number(value) || 0)}
                            min={0}
                          >
                            <NumberInputField />
                          </NumberInputRoot>
                        </CustomField>

                        <Box p={4} bg="yellow.50" borderRadius="md">
                          <Text fontSize="sm" color="yellow.700" fontWeight="medium">
                            Balance: {copFormatter.format(cashInRegister - cashWithdrawn)}
                          </Text>
                        </Box>

                        <CustomField label="Notas">
                          <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Observaciones del cierre de caja..."
                            style={{
                              width: '100%',
                              padding: '8px',
                              borderRadius: '6px',
                              border: '1px solid #E2E8F0',
                              fontSize: '14px',
                              minHeight: '80px',
                              resize: 'vertical'
                            }}
                          />
                        </CustomField>

                        <HStack gap={3}>
                          <Button 
                            colorScheme="blue" 
                            onClick={handleCashClosing}
                            disabled={isClosing}
                            flex={1}
                          >
                            {isClosing ? 'Cerrando...' : 'Realizar Cierre'}
                          </Button>
                          <Button 
                            variant="outline" 
                            onClick={generateReport}
                            flex={1}
                          >
                            Generar Reporte
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  </Box>
                </GridItem>
              </Grid>
            ) : (
              <Box textAlign="center" py={8} color="gray.500">
                <Text fontSize="lg" mb={2}>
                  No hay datos disponibles
                </Text>
                <Text fontSize="sm">
                  No se encontraron datos de cierre de caja para la fecha seleccionada.
                </Text>
              </Box>
            )}
          </VStack>
        </Container>
      </Box>
      <Toaster />
    </Flex>
  );
};

export default CashClosingPage;
