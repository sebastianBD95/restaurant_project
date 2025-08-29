'use client';

import React, { useEffect, useState } from 'react';
import { Table, Typography, Button, Modal, List, Space } from 'antd';
import { Box, Heading } from '@chakra-ui/react';
import dayjs from 'dayjs';
import { useParams } from 'react-router-dom';
import { getOrdersByRestaurant } from '../../services/orderService';
import { toaster } from '../ui/toaster';

interface Producto {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Pedido {
  table: string;
  timestamp: string;
  items: Producto[];
  total: number;
  observations: string;
}

const Historial: React.FC = () => {
  const [historial, setHistorial] = useState<Pedido[]>([]);
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { restaurantId } = useParams();

  useEffect(() => {
    async function fetchHistorial() {
      try {
        if (!restaurantId) return;
        const pedidos = await getOrdersByRestaurant(restaurantId, 'paid');
        if (Array.isArray(pedidos)) {
          const cleanedHistorial = pedidos.map((pedido) => ({
            ...pedido,
            total:
              pedido.total_price ??
              pedido.items.reduce((sum: number, p: any) => sum + p.price * p.quantity, 0),
            items: pedido.items ?? [],
          }));
          setHistorial(cleanedHistorial);
        }
      } catch (error) {
        toaster.create({
          title: 'Error',
          description: 'Error al cargar historial de pedidos.',
          type: 'error',
          duration: 5000,
        });
      }
    }
    fetchHistorial();
  }, [restaurantId]);

  // 📌 Agrupar pedidos por mesa
  const historialPorMesa = historial.reduce((acc: Record<string, Pedido[]>, pedido) => {
    if (!acc[pedido.table]) acc[pedido.table] = [];
    acc[pedido.table].push(pedido);
    return acc;
  }, {});

  // 📌 Mostrar detalles de un pedido en el modal
  const verDetalles = (pedido: Pedido) => {
    setPedidoDetalle(pedido);
    setModalVisible(true);
  };

  return (
    <Box p={6} bg="gray.100">
      <Heading textAlign="center" mb={6}>
        Historial de Pedidos Pagados
      </Heading>

      <Table
        dataSource={Object.entries(historialPorMesa).map(([mesa, ordenes]) => ({
          key: mesa,
          mesa: mesa,
          ordenes,
        }))}
        pagination={{ hideOnSinglePage: true, pageSize: 5 }}
        rowKey="mesa"
        bordered
        size="middle"
        expandable={{
          expandedRowRender: (record) => (
            <Table
              dataSource={record.ordenes}
              rowKey="timestamp"
              pagination={false}
              bordered
              size="small"
            >
              {/* 📌 Fecha y Hora */}
              <Table.Column<Pedido>
                title="Fecha y Hora"
                dataIndex="timestamp"
                key="timestamp"
                render={(timestamp) => (
                  <Typography.Text>{dayjs(timestamp).format('DD/MM/YYYY HH:mm')}</Typography.Text>
                )}
              />

              {/* 📌 Precio Total */}
              <Table.Column<Pedido>
                title="Total"
                dataIndex="total"
                key="total"
                align="right"
                render={(_, record) => {
                  // 📌 Calcular el total si no está definido
                  const totalCalculado =
                    record.total ??
                    (record.items && Array.isArray(record.items)
                      ? record.items.reduce(
                          (sum, item) => sum + (item.price * item.quantity || 0),
                          0
                        )
                      : 0);

                  return (
                    <Typography.Text strong>
                      {new Intl.NumberFormat('es-CO', {
                        style: 'currency',
                        currency: 'COP',
                      }).format(totalCalculado)}
                    </Typography.Text>
                  );
                }}
              />

              {/* 📌 Botón de Ver Detalles */}
              <Table.Column<Pedido>
                title="Detalles"
                key="actions"
                align="center"
                render={(_, record) => (
                  <Button type="primary" onClick={() => verDetalles(record)}>
                    Ver Detalles
                  </Button>
                )}
              />
            </Table>
          ),
        }}
      >
        {/* 📌 Número de Mesa */}
        <Table.Column
          title="Mesa #"
          dataIndex="mesa"
          key="mesa"
          render={(mesa) => (
            <Typography.Text strong style={{ fontSize: 16 }}>
              {mesa}
            </Typography.Text>
          )}
        />
      </Table>

      {/* 📌 Modal para mostrar los detalles del pedido */}
      <Modal
        title="Detalles del Pedido"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        {pedidoDetalle && pedidoDetalle.items && pedidoDetalle.items.length > 0 ? (
          <List
            dataSource={pedidoDetalle.items}
            renderItem={(producto) => (
              <List.Item>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                  <Typography.Text>{producto.name}</Typography.Text>
                  <Typography.Text type="secondary">x{producto.quantity}</Typography.Text>
                  <Typography.Text strong>
                    {new Intl.NumberFormat('es-CO', {
                      style: 'currency',
                      currency: 'COP',
                    }).format(producto.price * producto.quantity)}
                  </Typography.Text>
                </Space>
              </List.Item>
            )}
          />
        ) : (
          <Typography.Text>No hay productos en este pedido.</Typography.Text>
        )}
      </Modal>
    </Box>
  );
};

export default Historial;
