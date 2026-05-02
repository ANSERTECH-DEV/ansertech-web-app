import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CotizacionesService } from '../../../services/cotizaciones.service';
import {Quotation} from "../../../shared/model/quotation.dto";

interface StockItem {
  product: string;
  requested: number;
  inStock: number;
}

@Component({
  selector: 'app-review-detail',
  templateUrl: './review-detail.component.html',
  styleUrls: ['./review-detail.component.css']
})
export class ReviewDetailComponent implements OnInit {
  cotizacion?: Quotation;

  keywords = ['balanza precisión', 'sensor temperatura', 'tipo K', 'termómetro infrarojo', 'pesa calibración F1', 'estufa secado'];

  stockItems: StockItem[] = [
    { product: 'Estufa de secado 1000L',    requested: 1, inStock: 3 },
    { product: 'Balanza precisión 220gr',   requested: 2, inStock: 5 },
    { product: 'Sensor temperatura tipo K', requested: 2, inStock: 1 },
    { product: 'Termómetro infrarojo',      requested: 1, inStock: 0 },
    { product: 'Termohigrómetro ext.',      requested: 1, inStock: 2 },
    { product: 'Pesas calibración F1',      requested: 3, inStock: 2 },
  ];

  docItems = [
    { num: 1, est: 'FAB', equipo: 'Estufa de secado 1000L',    cant: 1, pu: 'S/ 1,200', total: 'S/ 1,200' },
    { num: 2, est: 'STK', equipo: 'Balanza precisión 220gr',   cant: 2, pu: 'S/ 350',   total: 'S/ 700'   },
    { num: 3, est: 'IMP', equipo: 'Sensor temperatura tipo K', cant: 2, pu: 'S/ 180',   total: 'S/ 360'   },
    { num: 4, est: 'FAB', equipo: 'Termómetro infrarojo',      cant: 1, pu: 'S/ 420',   total: 'S/ 420'   },
    { num: 5, est: 'STK', equipo: 'Termohigrómetro ext.',      cant: 1, pu: 'S/ 210',   total: 'S/ 210'   },
  ];

  constructor(private route: ActivatedRoute, private router: Router, private svc: CotizacionesService) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') || '';
    this.cotizacion = this.svc.getById(id) ?? {
      id, name: 'Cotización', client: '-', date: '-', amount: '-', status: 'Por aprobar'
    };
  }

  goBack(): void { this.router.navigate(['/cotizaciones']); }

  hasStockIssue(item: StockItem): boolean { return item.inStock < item.requested; }
}
