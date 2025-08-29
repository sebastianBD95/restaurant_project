import { useState, useCallback } from 'react';
import { getTables } from '../services/tableService';
import { Table } from '../interfaces/table';

export function useTables(restaurantId?: string) {
  const [tables, setTables] = useState<Table[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTables = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    setError(null);
    try {
      const tables = await getTables(restaurantId);
      setTables(tables);
    } catch (err: any) {
      setError('Error cargando mesas.');
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  return { tables, loading, error, fetchTables };
} 