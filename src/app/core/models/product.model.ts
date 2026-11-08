export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  unit: string;
  stockQuantity: number;
  minStockThreshold: number;
  unitPrice: number;
  currency: string;
  supplierName: string;
  brand: string;
  active: boolean;
  lowStock: boolean;
  updatedAt: string;
}

export interface ProductRequest {
  sku: string;
  name: string;
  category?: string;
  description?: string;
  unit?: string;
  stockQuantity: number;
  minStockThreshold?: number;
  unitPrice: number;
  currency?: string;
  supplierName?: string;
  brand?: string;
}

export type ImportAction = 'CREATE' | 'UPDATE' | 'UNCHANGED' | 'ERROR';

export interface ImportRow {
  rowNumber: number;
  sku: string;
  name: string;
  brand: string;
  action: ImportAction;
  oldStock?: number;
  newStock?: number;
  oldPrice?: number;
  newPrice?: number;
  message?: string;
}

export interface ImportResult {
  dryRun: boolean;
  totalRows: number;
  created: number;
  updated: number;
  unchanged: number;
  errors: number;
  rows: ImportRow[];
}
