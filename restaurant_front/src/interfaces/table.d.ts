export interface Table {
    table_id: string;
    restaurant_id: string;
    table_number: number;
    qr_code: string;
    status: string;
  }
  
  export interface CreateTableRequest {
    restaurant_id: string;
    table_number: number;
    qr_code: string;
    status: string;
  }
  
  export interface CreateTableResponse {
    table_id: string;
  }