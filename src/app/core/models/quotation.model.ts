export interface QuotationItemResponse {
  id: number;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  subtotal: number;
  availabilityStatus: 'IN_STOCK' | 'OUT_OF_STOCK' | 'ON_ORDER' | null;
}

export interface QuotationResponse {
  id: number;
  rfqId: number;
  quotationNumber: string;
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED';
  subtotal: number;
  igv: number;
  total: number;
  currency: string;
  validUntil: string;
  pdfPath: string;
  aiSummary: string;
  conversionProbability: number;
  items: QuotationItemResponse[];
  createdAt: string;
  sentAt: string;
}
