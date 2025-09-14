import React, { useState, useEffect } from 'react';
import { Box, Text, Image, Spinner, Button, Icon, Flex, Stack } from '@chakra-ui/react';
import { Table as TableInterface } from '../../interfaces/table';
import { FiDownload, FiPrinter, FiExternalLink } from 'react-icons/fi';
import QRCode from 'qrcode';
import { useParams } from 'react-router-dom';

interface TableQRTableProps {
  tables: TableInterface[];
}

const TableQRTable: React.FC<TableQRTableProps> = ({ tables }) => {
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});
  const [generating, setGenerating] = useState<{ [key: string]: boolean }>({});
  const { restaurantId } = useParams();

  const generateQRCode = async (table: TableInterface) => {
    try {
      setGenerating(prev => ({ ...prev, [table.table_id]: true }));
      
      // Construct proper URL for customer menu
      const baseUrl = window.location.origin;
      const menuUrl = `${baseUrl}/menu/${restaurantId}?table=${table.table_id}`;
      
      const qrDataURL = await QRCode.toDataURL(menuUrl, {
        width: 120,
        margin: 2,
        color: {
          dark: '#1a202c',
          light: '#ffffff'
        },
        errorCorrectionLevel: 'M'
      });
      
      setQrCodes(prev => ({ ...prev, [table.table_id]: qrDataURL }));
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setGenerating(prev => ({ ...prev, [table.table_id]: false }));
    }
  };

  const downloadQRCode = (table: TableInterface) => {
    if (!qrCodes[table.table_id]) return;
    
    const link = document.createElement('a');
    link.download = `QR_Mesa_${table.table_number}.png`;
    link.href = qrCodes[table.table_id];
    link.click();
  };

  const openMenuUrl = (table: TableInterface) => {
    const baseUrl = window.location.origin;
    const menuUrl = table.qr_code;
    window.open(menuUrl, '_blank');
  };

  useEffect(() => {
    tables.forEach(table => {
      if (!qrCodes[table.table_id] && !generating[table.table_id]) {
        generateQRCode(table);
      }
    });
  }, [tables]);

  if (tables.length === 0) {
    return (
      <Box textAlign="center" py={12}>
        <Text fontSize="6xl" mb={6}>🏢</Text>
        <Text color="gray.500" fontSize="xl" mb={3} fontWeight="medium">No hay mesas configuradas</Text>
        <Text color="gray.400" fontSize="md">Agrega mesas para generar códigos QR</Text>
      </Box>
    );
  }

  return (
    <Box width="100%">
      <Stack gap={4}>
        {tables
          .sort((a, b) => a.table_number - b.table_number)
          .map((table) => (
            <Box
              key={table.table_id}
              p={4}
              bg="white"
              borderRadius="xl"
              border="1px solid"
              borderColor="gray.200"
              _hover={{
                borderColor: "blue.300",
                boxShadow: "lg",
                transform: "translateY(-2px)"
              }}
              transition="all 0.3s ease"
            >
              <Flex align="center" justify="space-between" gap={4}>
                {/* Table Number */}
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  w="60px"
                  h="60px"
                  borderRadius="full"
                  bg="blue.100"
                  color="blue.700"
                  fontWeight="bold"
                  fontSize="2xl"
                  flexShrink={0}
                >
                  {table.table_number}
                </Box>

                {/* QR Code */}
                <Box flex={1} display="flex" justifyContent="center">
                  {generating[table.table_id] ? (
                    <Box
                      w="120px"
                      h="120px"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      border="2px solid"
                      borderColor="gray.200"
                      borderRadius="xl"
                      bg="gray.50"
                    >
                      <Stack gap={2} align="center">
                        <Spinner size="lg" color="blue.500" />
                        <Text fontSize="xs" color="gray.500">Generando...</Text>
                      </Stack>
                    </Box>
                  ) : qrCodes[table.table_id] ? (
                    <Box
                      p={3}
                      bg="white"
                      borderRadius="xl"
                      boxShadow="md"
                      border="2px solid"
                      borderColor="gray.200"
                      _hover={{
                        borderColor: "blue.300",
                        boxShadow: "lg"
                      }}
                      transition="all 0.2s"
                    >
                      <Image
                        src={qrCodes[table.table_id]}
                        alt={`QR Code for Table ${table.table_number}`}
                        boxSize="120px"
                        objectFit="contain"
                      />
                    </Box>
                  ) : (
                    <Button
                      onClick={() => generateQRCode(table)}
                      colorScheme="blue"
                      variant="outline"
                      size="lg"
                    >
                      Generar QR
                    </Button>
                  )}
                </Box>

                {/* Actions */}
                <Stack gap={2} flexShrink={0}>
                  {qrCodes[table.table_id] && (
                    <>
                      <Button
                        onClick={() => downloadQRCode(table)}
                        size="sm"
                        colorScheme="green"
                        variant="outline"
                      >
                        <Icon as={FiDownload} mr={2} />
                        Descargar
                      </Button>
                      <Button
                        onClick={() => openMenuUrl(table)}
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                      >
                        <Icon as={FiExternalLink} mr={2} />
                        Ver Orden de la mesa
                      </Button>
                    </>
                  )}
                </Stack>
              </Flex>
            </Box>
          ))}
      </Stack>
    </Box>
  );
};

export default TableQRTable;
