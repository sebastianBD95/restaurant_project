import React, { useState, useEffect } from 'react';
import { Box, Text, Image, Spinner, Table } from '@chakra-ui/react';
import { Table as TableInterface } from '../../interfaces/table';
import QRCode from 'qrcode';

interface TableQRTableProps {
  tables: TableInterface[];
}

const TableQRTable: React.FC<TableQRTableProps> = ({ tables  }) => {
  const [qrCodes, setQrCodes] = useState<{ [key: string]: string }>({});

  const generateQRCode = async (url: string, tableId: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(url, {
        width: 100,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodes(prev => ({ ...prev, [tableId]: qrDataURL }));
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  useEffect(() => {

    tables.forEach(table => {
      if (table.qr_code && !qrCodes[table.table_id]) {
        generateQRCode(table.qr_code, table.table_id);
      }
    });
  }, [tables, qrCodes]);

  if (tables.length === 0) {
    return (
      <Box textAlign="center" py={8}>
        <Text fontSize="4xl" mb={4}>🏢</Text>
        <Text color="gray.500" fontSize="lg" mb={2}>No hay mesas configuradas</Text>
        <Text color="gray.400" fontSize="sm">Agrega mesas para generar códigos QR</Text>
      </Box>
    );
  }

  return (
    <Box overflowX="auto" width="100%">
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader 
              textAlign="center" 
              fontWeight="bold" 
              color="gray.700"
              bg="gray.50"
            >
              Mesa
            </Table.ColumnHeader>
            <Table.ColumnHeader 
              textAlign="center" 
              fontWeight="bold" 
              color="gray.700"
              bg="gray.50"
            >
              Código QR
            </Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tables
            .sort((a, b) => a.table_id.localeCompare(b.table_id))
            .map((table) => (
            <Table.Row 
              key={table.table_id}
              _hover={{ bg: "gray.50" }}
              transition="background-color 0.2s"
            >
              <Table.Cell textAlign="center">
                <Box
                  display="inline-flex"
                  alignItems="center"
                  justifyContent="center"
                  w="40px"
                  h="40px"
                  borderRadius="full"
                  bg="blue.100"
                  color="blue.700"
                  fontWeight="bold"
                  fontSize="lg"
                >
                  {table.table_number}
                </Box>
              </Table.Cell>
              <Table.Cell textAlign="center">
                {qrCodes[table.table_id] ? (
                  <Box
                    display="inline-block"
                    p={2}
                    bg="white"
                    borderRadius="lg"
                    boxShadow="sm"
                    border="2px solid"
                    borderColor="gray.200"
                    _hover={{
                      borderColor: "blue.300",
                      boxShadow: "md",
                      transform: "scale(1.05)"
                    }}
                    transition="all 0.2s"
                    cursor="pointer"
                    title="Código QR para Mesa"
                  >
                    <Image
                      src={qrCodes[table.table_id]}
                      alt={`QR Code for Table ${table.table_number}`}
                      boxSize="100px"
                      objectFit="contain"
                    />
                  </Box>
                ) : (
                  <Box
                    boxSize="100px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="2px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    bg="gray.50"
                    mx="auto"
                  >
                    <Spinner size="md" color="blue.500" />
                  </Box>
                )}
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default TableQRTable;
