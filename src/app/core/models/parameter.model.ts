/** Fila de la tabla parameters (GET /api/parameters). */
export interface Parameter {
  id: number;
  name: string;
  description?: string;
  value: number;
  createdAt?: string;
}
