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

  return (
    <Box overflowX="auto" width="100%">
      <Table.Root variant="outline" size="sm">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeader>Número de Mesa</Table.ColumnHeader>
            <Table.ColumnHeader>QR Code</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {tables
            .sort((a, b) => a.table_id.localeCompare(b.table_id))
            .map((table) => (
            <Table.Row key={table.table_id}>
              <Table.Cell>
                <Text fontWeight="medium">{table.table_number}</Text>
              </Table.Cell>
              <Table.Cell>
                {qrCodes[table.table_id] ? (
                  <Image
                    src={qrCodes[table.table_id]}
                    alt={`QR Code for Table ${table.table_number}`}
                    boxSize="80px"
                    objectFit="contain"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                  />
                ) : (
                  <Box
                    boxSize="80px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <Spinner size="sm" color="blue.500" />
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
