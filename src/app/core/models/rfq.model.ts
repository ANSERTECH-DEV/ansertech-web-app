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
  status: 'PENDING_REVIEW' | 'IN_PROGRESS' | 'REJECTED' | 'QUOTED';
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
