export interface Quotation {
  id: string;
  name: string;
  client: string;
  date: string;
  amount: string;
  status: 'En cola' | 'En proceso' | 'Por aprobar';
}
