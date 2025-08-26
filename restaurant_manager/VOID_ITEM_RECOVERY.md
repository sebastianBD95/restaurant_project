# Void Item Recovery Functionality

## Overview

The void item recovery functionality allows you to recover a voided order item and move it to a new order. This is useful when a customer wants to reorder an item that was previously voided.

## API Endpoint

### Recover Void Order Item

**POST** `/void-order-items/{void_order_item_id}/recover`

Recovers a void order item and adds it to a specified target order.

#### Path Parameters

- `void_order_item_id` (string, required): The ID of the void order item to recover

#### Request Body

```json
{
  "target_order_id": "string"
}
```

#### Request Body Parameters

- `target_order_id` (string, required): The ID of the order where the recovered item should be added

#### Response

- **200 No Content**: Successfully recovered the void item
- **400 Bad Request**: Invalid request body
- **404 Not Found**: Void order item not found
- **500 Internal Server Error**: Server error during recovery

#### Example Request

```bash
curl -X POST "http://localhost:8080/void-order-items/123e4567-e89b-12d3-a456-426614174000/recover" \
  -H "Content-Type: application/json" \
  -d '{
    "target_order_id": "456e7890-e89b-12d3-a456-426614174001"
  }'
```

## How It Works

1. **Validation**: The system checks if the void order item exists and is available for recovery (status = "voided")
2. **Target Order Validation**: Verifies that the target order exists and contains a matching item (same menu item ID and observation)
3. **Quantity Update**: Adds the void item quantity to the existing matching order item in the target order
4. **Inventory Update**: Deducts the required ingredients from inventory
5. **Void Item Deletion**: Removes the void order item from the void table
6. **Transaction Safety**: All operations are performed within a database transaction to ensure data consistency

## Business Rules

- Only void items with status "voided" can be recovered
- The target order must contain a matching item (same menu item ID and observation) for recovery to be possible
- The recovered item quantity is added to the existing matching item in the target order
- The recovered item maintains its original price and observation
- Inventory is automatically updated when the item is recovered
- The void item is permanently deleted after successful recovery

## Related Endpoints

- **GET** `/restaurants/{restaurant_id}/order-items/void` - Get all void order items for a restaurant
- **POST** `/orders/{order_id}/items/{menu_item_id}/void` - Create a void order item

## Error Handling

The system handles various error scenarios:

- **Void item not found**: Returns 404 error
- **Void item already recovered**: Returns error indicating item is not available for recovery
- **Target order not found**: Returns error indicating target order does not exist
- **No matching item in target order**: Returns error indicating target order does not contain a matching item for recovery
- **Insufficient inventory**: Returns error during inventory deduction
- **Database transaction failure**: Rolls back all changes and returns error
