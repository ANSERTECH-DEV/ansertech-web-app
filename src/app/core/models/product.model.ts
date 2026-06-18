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
