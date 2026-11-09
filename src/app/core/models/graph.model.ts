export type GraphConnectionStatus = 'NOT_CONNECTED' | 'PENDING' | 'CONNECTED' | 'ERROR';

/** Estado de la vinculación con Outlook (GET /api/auth/graph/device-code). */
export interface GraphConnection {
  status: GraphConnectionStatus;
  url?: string;
  code?: string;
  rawMessage?: string;
  expiresOn?: string;
  timestamp?: string;
  error?: string;
  source?: 'MEMORY' | 'LOG';
}
