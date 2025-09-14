'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, Icon, Flex, Stack, useBreakpointValue } from '@chakra-ui/react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import { CreateTableRequest, Table } from '../../interfaces/table';
import { FaLock, FaUnlock, FaPlus } from 'react-icons/fa';
import '../../pages/styles/TableComponent.css';
import { createTable } from '../../services/tableService';
import { useParams } from 'react-router-dom';

interface Mesa {
  table_id: string;
  x: number;
  y: number;
  shape: 'rect' | 'circle';
  isOccupied: boolean;
  isProcessingPayment: boolean;
  table_number: number;
  qr_code: string;
}

interface TableDistributionProps {
  mesas: Table[];
  fetchTables: () => Promise<void>;
}

const TableDistribution: React.FC<TableDistributionProps> = ({ mesas, fetchTables }) => {
  const { restaurantId } = useParams();
  const [layout, setLayout] = useState<Mesa[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hoveredTable, setHoveredTable] = useState<number | null>(null);

  // Responsive stage size
  const stageWidth = useBreakpointValue({ base: 400, sm: 600, md: 900, lg: 1200 });
  const stageHeight = useBreakpointValue({ base: 350, sm: 500, md: 700, lg: 900 });

  useEffect(() => {
    // Map mesas prop to layout state with positions
    const savedLayout = localStorage.getItem('mesasLayout');
    let positions: { [key: string]: { x: number; y: number } } = {};
    if (savedLayout) {
      const savedMesas = JSON.parse(savedLayout);
      positions = savedMesas.reduce(
        (acc: { [key: string]: { x: number; y: number } }, mesa: Mesa) => {
          acc[mesa.table_id] = { x: mesa.x, y: mesa.y };
          return acc;
        },
        {}
      );
    }
    const newLayout = mesas.map((table: Table, index: number) => ({
      table_id: table.table_id,
      x: positions[table.table_id]?.x ?? 100 + (index % 5) * 100,
      y: positions[table.table_id]?.y ?? 100 + Math.floor(index / 5) * 100,
      shape: 'rect' as const,
      isOccupied: table.status === 'occupied',
      isProcessingPayment: table.status === 'processing_payment',
      table_number: table.table_number,
      qr_code: table.qr_code,
    }));
    setLayout(newLayout);
  }, [mesas]);

  useEffect(() => {
    if (layout.length > 0) {
      localStorage.setItem('mesasLayout', JSON.stringify(layout));
    }
  }, [layout]);

  const handleCreateTable = async () => {
    const table: CreateTableRequest = {
      status: 'available',
      restaurant_id: restaurantId!,
      table_number: layout.length + 1,
      qr_code: `/tables/${layout.length + 1}`,
    };
    await createTable(table);
    await fetchTables();
  };

  const handleDragEnd = (e: any, tableNumber: number) => {
    if (isLocked) return;
    const newX = e.target.x();
    const newY = e.target.y();
    setLayout((prevLayout) =>
      prevLayout.map((mesa) =>
        mesa.table_number === tableNumber ? { ...mesa, x: newX, y: newY } : mesa
      )
    );
  };

  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  const toggleShape = (tableNumber: number) => {
    setLayout(
      layout.map((mesa) =>
        mesa.table_number === tableNumber
          ? { ...mesa, shape: mesa.shape === 'rect' ? 'circle' : 'rect' }
          : mesa
      )
    );
  };

  const getMesaColor = (mesa: Mesa): string => {
    if (mesa.isProcessingPayment) return '#FFD700';
    if (mesa.isOccupied) return '#FF6B6B';
    return '#4CAF50';
  };

  return (
    <Box className="container" p={{ base: 2, md: 6 }} width="100%" height="100%">
      <Flex
        direction={{ base: 'column', sm: 'row' }}
        justify="space-between"
        align={{ base: 'stretch', sm: 'center' }}
        mb={8}
        gap={4}
      >
        <Heading className="heading" fontSize={{ base: 'xl', md: '2xl', lg: '3xl' }} color="blue.600">
          📍 Distribución de Mesas
        </Heading>
        <Stack direction={{ base: 'column', sm: 'row' }} gap={3}>
          <Button
            onClick={toggleLock}
            colorScheme={isLocked ? 'red' : 'blue'}
            size={{ base: 'md', md: 'lg' }}
            fontSize={{ base: 'md', md: 'lg' }}
            px={6}
            py={3}
          >
            <Icon as={isLocked ? FaUnlock : FaLock} mr={2} />
            {isLocked ? 'Desbloquear' : 'Bloquear'}
          </Button>
          <Button
            onClick={handleCreateTable}
            colorScheme="green"
            size={{ base: 'md', md: 'lg' }}
            fontSize={{ base: 'md', md: 'lg' }}
            px={6}
            py={3}
          >
            <Icon as={FaPlus} mr={2} />
            Agregar Mesa
          </Button>
        </Stack>
      </Flex>
      <Flex justify="center" width="100%">
        <Stage width={stageWidth} height={stageHeight} className="stage" style={{ width: '100%' }}>
          <Layer>
            <Text
              className="instruction-text"
              text="Arrastra las mesas y haz clic para cambiar su forma"
              x={20}
              y={20}
              fontSize={14}
              width={stageWidth ? stageWidth - 40 : 800}
              wrap="word"
            />
            {layout.map((mesa) => (
              <Group
                key={mesa.table_id}
                draggable={!isLocked}
                x={mesa.x}
                y={mesa.y}
                onClick={() => toggleShape(mesa.table_number)}
                onDragEnd={(e) => handleDragEnd(e, mesa.table_number)}
                onMouseEnter={() => setHoveredTable(mesa.table_number)}
                onMouseLeave={() => setHoveredTable(null)}
              >
                {mesa.shape === 'rect' ? (
                  <Rect
                    id={mesa.table_id}
                    width={70}
                    height={70}
                    fill={getMesaColor(mesa)}
                    className={`table-rect ${hoveredTable === mesa.table_number ? 'table-hover' : ''}`}
                  />
                ) : (
                  <Circle
                    id={mesa.table_id}
                    radius={35}
                    fill={getMesaColor(mesa)}
                    className={`table-circle ${hoveredTable === mesa.table_number ? 'table-hover' : ''}`}
                  />
                )}
                <Text
                  text={mesa.table_number.toString()}
                  className="table-text"
                  x={mesa.shape === 'rect' ? 25 : -8}
                  y={mesa.shape === 'rect' ? 25 : -8}
                  width={mesa.shape === 'rect' ? 20 : 16}
                  height={20}
                />
              </Group>
            ))}
          </Layer>
        </Stage>
      </Flex>
    </Box>
  );
};

export default TableDistribution;
