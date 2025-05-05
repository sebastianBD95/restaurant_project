'use client';

import React, { useEffect, useState } from 'react';
import { Box, Heading, Button, Icon, Flex, Stack, useBreakpointValue } from '@chakra-ui/react';
import { Stage, Layer, Rect, Circle, Text, Group } from 'react-konva';
import { getTables, createTable } from '../../services/tableService';
import { Table } from '../../interfaces/table';
import { useParams } from 'react-router-dom';
import { FaLock, FaUnlock, FaPlus } from 'react-icons/fa';
import '../../pages/styles/TableComponent.css';

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

const TableDistribution: React.FC = () => {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [hoveredTable, setHoveredTable] = useState<number | null>(null);
  const restaurantId = useParams().restaurantId;

  // Responsive stage size
  const stageWidth = useBreakpointValue({ base: 320, sm: 400, md: 700, lg: 800 });
  const stageHeight = useBreakpointValue({ base: 300, sm: 350, md: 500, lg: 550 });

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const tables = await getTables(restaurantId!);
        const savedLayout = localStorage.getItem('mesasLayout');
        let positions: { [key: string]: { x: number; y: number } } = {};
        
        if (savedLayout) {
          const savedMesas = JSON.parse(savedLayout);
          positions = savedMesas.reduce((acc: { [key: string]: { x: number; y: number } }, mesa: Mesa) => {
            acc[mesa.table_id] = { x: mesa.x, y: mesa.y };
            return acc;
          }, {});
        }

        const newMesas = tables.map((table: Table, index: number) => ({
          table_id: table.table_id,
          x: positions[table.table_id]?.x ?? 100 + (index % 5) * 100,
          y: positions[table.table_id]?.y ?? 100 + Math.floor(index / 5) * 100,
          shape: 'rect' as const,
          isOccupied: false,
          isProcessingPayment: false,
          table_number: table.table_number,
          qr_code: table.qr_code,
        }));

        setMesas(newMesas);
      } catch (error) {
        console.error('Error fetching tables:', error);
      }
    };

    fetchTables();
  }, [restaurantId]);

  useEffect(() => {
    if (mesas.length > 0) {
      localStorage.setItem('mesasLayout', JSON.stringify(mesas));
    }
  }, [mesas]);

  const handleCreateTable = async () => {
    try {
      const tableNumber = mesas.length + 1;
      const response = await createTable({
        restaurant_id: restaurantId!,
        table_number: tableNumber,
        qr_code: `/tables/${tableNumber}`,
      });

      setMesas((prevMesas) => [
        ...prevMesas,
        {
          table_id: response.table_id,
          x: 100 + (prevMesas.length % 5) * 100,
          y: 100 + Math.floor(prevMesas.length / 5) * 100,
          shape: 'rect',
          isOccupied: false,
          isProcessingPayment: false,
          table_number: tableNumber,
          qr_code: `/tables/${tableNumber}`,
        },
      ]);
    } catch (error) {
      console.error('Error creating table:', error);
    }
  };

  const handleDragEnd = (e: any, tableNumber: number) => {
    if (isLocked) return;
    const newX = e.target.x();
    const newY = e.target.y();
    setMesas((prevMesas) =>
      prevMesas.map((mesa) =>
        mesa.table_number === tableNumber ? { ...mesa, x: newX, y: newY } : mesa
      )
    );
  };

  const toggleLock = () => {
    setIsLocked((prev) => !prev);
  };

  const toggleShape = (tableNumber: number) => {
    setMesas(
      mesas.map((mesa) =>
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
    <Box className="container" p={{ base: 2, md: 6 }}>
      <Flex direction={{ base: 'column', sm: 'row' }} justify="space-between" align={{ base: 'stretch', sm: 'center' }} mb={6} gap={2}>
        <Heading className="heading" fontSize={{ base: 'lg', md: 'xl' }}>
          📍 Distribución de Mesas
        </Heading>
        <Stack direction={{ base: 'column', sm: 'row' }} gap={2}>
          <Button 
            onClick={toggleLock} 
            colorScheme={isLocked ? 'red' : 'blue'}
            className="button"
            fontSize={{ base: 'sm', md: 'md' }}
          >
            <Icon as={isLocked ? FaUnlock : FaLock} className="button-icon" />
            {isLocked ? 'Desbloquear' : 'Bloquear'}
          </Button>
          <Button 
            onClick={handleCreateTable} 
            colorScheme="green"
            className="button"
            fontSize={{ base: 'sm', md: 'md' }}
          >
            <Icon as={FaPlus} className="button-icon" />
            Agregar Mesa
          </Button>
        </Stack>
      </Flex>
      <Box overflowX="auto">
        <Stage width={stageWidth} height={stageHeight} className="stage">
          <Layer>
            <Text 
              className="instruction-text"
              text="Arrastra las mesas y haz clic para cambiar su forma" 
              x={20} 
              y={20} 
              fontSize={14}
            />
            {mesas.map((mesa) => (
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
      </Box>
    </Box>
  );
};

export default TableDistribution;
