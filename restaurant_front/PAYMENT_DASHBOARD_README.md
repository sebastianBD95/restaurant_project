# 🏦 Dashboard de Historial de Pagos

## Descripción

El **Dashboard de Historial de Pagos** es una herramienta completa para gestionar y analizar el historial de todos los pagos realizados en el restaurante. Proporciona filtros avanzados, estadísticas detalladas y funcionalidades de exportación.

## 🚀 Características Principales

### 📊 Filtros de Tiempo
- **Este mes**: Muestra pagos del mes actual
- **Últimos 3 meses**: Pagos de los últimos 3 meses
- **Este año**: Pagos del año en curso
- **Todo el historial**: Todos los pagos registrados

### 💳 Filtros por Método de Pago
- Efectivo
- Débito
- Crédito
- PSE
- Todos los métodos

### 📈 Estadísticas en Tiempo Real
- **Ingresos Totales**: Suma de todos los pagos filtrados
- **Total de Pagos**: Número de transacciones
- **Pago Promedio**: Promedio por transacción
- **Distribución por Método**: Conteo de pagos por método
- **Top 5 Mesas**: Mesas con mayores ingresos

### 📋 Tabla Detallada
- Fecha y hora del pago
- Número de mesa
- Monto total
- Método de pago
- Información del cliente
- Estado del pago

### 💾 Funcionalidades de Exportación
- Exportación a CSV con formato español
- Incluye todos los campos relevantes
- Nombre de archivo con fecha automática

## 🛠️ Instalación y Uso

### 1. Acceso al Dashboard
```
URL: /historial-pagos
URL con restaurante: /historial-pagos/:restaurantId
```

### 2. Navegación
- Desde la página de pagos: Botón "📊 Ver Historial de Pagos"
- Desde el menú principal: Enlace "Historial Pagos"
- Navegación directa por URL

### 3. Uso de Filtros
1. Selecciona el filtro de tiempo deseado
2. Elige el método de pago (opcional)
3. Los datos se actualizan automáticamente
4. Las estadísticas se recalculan en tiempo real

## 🔧 Configuración Técnica

### Dependencias
- React 18+
- Chakra UI
- Day.js para manejo de fechas
- React Router para navegación

### Servicios Utilizados
- `paymentHistoryService.ts`: Servicio principal para datos de pagos
- `orderService.ts`: Servicio base para órdenes

### Interfaces de Datos
```typescript
interface PaymentRecord {
  order_id: string;
  table: number;
  items: any[];
  total_price: number;
  status: string;
  created_at: string;
  payment_method: string;
  customer_name: string;
  customer_id: string;
  customer_email: string;
  restaurant_id: string;
}
```

## 📱 Responsive Design

El dashboard está completamente optimizado para:
- **Desktop**: Vista completa con todas las funcionalidades
- **Tablet**: Layout adaptativo con grid responsivo
- **Mobile**: Vista móvil optimizada con scroll horizontal

## 🎨 Personalización

### Colores por Método de Pago
- **Efectivo**: Verde
- **Débito**: Azul
- **Crédito**: Púrpura
- **PSE**: Naranja

### Temas
- Soporte para modo claro/oscuro
- Colores consistentes con el sistema de diseño
- Iconos descriptivos para mejor UX

## 🔍 Casos de Uso

### Para Gerentes
- Análisis de ingresos por período
- Identificación de métodos de pago más populares
- Seguimiento de rendimiento por mesa

### Para Contadores
- Exportación de datos para reportes
- Análisis de tendencias de pagos
- Conciliación de ingresos

### Para Personal de Servicio
- Verificación de pagos procesados
- Seguimiento de clientes frecuentes
- Historial de transacciones por mesa

## 🚨 Solución de Problemas

### Error de Carga de Datos
- Verificar conexión a la API
- Comprobar autenticación del usuario
- Revisar logs del navegador

### Filtros No Funcionan
- Verificar que el restauranteId esté presente
- Comprobar permisos del usuario
- Validar formato de fechas

### Exportación Fallida
- Verificar permisos de descarga del navegador
- Comprobar que haya datos para exportar
- Revisar formato de datos

## 🔮 Próximas Funcionalidades

- [ ] Gráficos interactivos con Chart.js
- [ ] Filtros por rango de fechas personalizado
- [ ] Búsqueda por nombre de cliente
- [ ] Notificaciones en tiempo real
- [ ] Integración con sistemas de facturación
- [ ] Reportes automáticos por email

## 📞 Soporte

Para reportar bugs o solicitar nuevas funcionalidades:
1. Crear un issue en el repositorio
2. Incluir pasos para reproducir el problema
3. Adjuntar capturas de pantalla si es necesario
4. Especificar versión del navegador y sistema operativo

---

**Desarrollado con ❤️ para el Restaurant Manager**