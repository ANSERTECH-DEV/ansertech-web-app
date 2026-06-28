export interface RfqItemResponse {
  id: number;
  productCode: string;
  productDescription: string;
  quantity: number;
  unit: string;
  fieldConfidence: number;
}

export interface RfqResponse {
  id: number;
  emailId: number;
  rfqType: string;
  clientName: string;
  clientCompany: string;
  clientEmail: string;
  clientPhone: string;
  urgency: string;
  extractionConfidence: number;
  status: 'PROCESSING' | 'PENDING_REVIEW' | 'QUOTING' | 'QUOTED' | 'REJECTED';
  notes: string;
  conversionProbability: number;
  items: RfqItemResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface StockCheckItem {
  rfqItemId: number;
  rfqDescription: string;
  quantityRequested: number;
  unitRequested: string;
  matched: boolean;
  productId?: number;
  productSku?: string;
  productName?: string;
  similarityScore?: number;
  matchReason?: string;
  stockQuantity?: number;
  stockUnit?: string;
  stockSufficient?: boolean;
  unitPrice?: number;
}

export interface StockCheckResultResponse {
  rfqId: number;
  status: 'PROCESSING' | 'DONE' | 'FAILED';
  items?: StockCheckItem[];
  processedAt?: string;
  errorMessage?: string;
}
