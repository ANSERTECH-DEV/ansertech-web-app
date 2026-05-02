import { Injectable } from '@angular/core';
import {Quotation} from "../shared/model/quotation.dto";

@Injectable({ providedIn: 'root' })
export class CotizacionesService {
  private data: Quotation[] = [
    { id: 'COT-2024-043', name: 'Tester temperatura agua',      client: 'AgroTech SAC',      date: '24 Abr', amount: 'S/ 420',   status: 'En cola' },
    { id: 'COT-2024-042', name: 'Kit colorímetro cloro',        client: 'Lab. Química Sur',  date: '23 Abr', amount: 'S/ 680',   status: 'En cola' },
    { id: 'COT-2024-041', name: 'Medidores pH HANNA x4',        client: 'Minera Los Andes',  date: '22 Abr', amount: 'S/ 1,240', status: 'En cola' },
    { id: 'COT-2024-040', name: 'Electrodo Ag/AgCl',            client: 'Industrias Perú',   date: '21 Abr', amount: 'S/ 390',   status: 'En proceso' },
    { id: 'COT-2024-039', name: 'Sensor conductividad TDS',     client: 'AgroTech SAC',      date: '20 Abr', amount: 'S/ 950',   status: 'En proceso' },
    { id: 'COT-2024-038', name: 'Mantenimiento multiparámetro', client: 'Minera Los Andes',  date: '19 Abr', amount: 'S/ 540',   status: 'En proceso' },
    { id: 'COT-2024-037', name: 'Reparación medidor ORP',       client: 'Lab. Química Sur',  date: '18 Abr', amount: 'S/ 310',   status: 'Por aprobar' },
    { id: 'COT-2024-036', name: 'Verificación operacional x3',  client: 'Industrias Perú',   date: '16 Abr', amount: 'S/ 870',   status: 'Por aprobar' },
    { id: 'COT-2024-035', name: 'Combo pH/Con/TDS HI98130',     client: 'Minera Los Andes',  date: '15 Abr', amount: 'S/ 2,205', status: 'Por aprobar' },
  ];

  getById(id: string): Quotation | undefined {
    return this.data.find(c => c.id === id);
  }

  filterByStatus(status: string): Quotation[] {
    if (status === 'Todas') return this.data;
    return this.data.filter(c => c.status === status);
  }

  countByStatus(status: string): number {
    return this.data.filter(c => c.status === status).length;
  }
}
