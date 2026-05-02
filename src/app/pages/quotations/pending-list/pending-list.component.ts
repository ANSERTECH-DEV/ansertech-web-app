import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CotizacionesService } from '../../../services/cotizaciones.service';
import {Quotation} from "../../../shared/model/quotation.dto";

@Component({
  selector: 'app-pending-list',
  templateUrl: './pending-list.component.html',
  styleUrls: ['./pending-list.component.css']
})
export class PendingListComponent implements OnInit {
  stateOptions:any[]=[
    {name: 'Todas',value: 'Todas'},
    {name: 'En cola',value: 'En cola'},
    {name: 'En proceso',value: 'En proceso'},
    {name: 'Por aprobar',value: 'Por aprobar'},
  ]
  activeTab = 'Todas';
  items: Quotation[] = [];

  constructor(private svc: CotizacionesService, private router: Router) {}

  /**
   * Angular lifecycle hook that runs after component initialization.
   *
   * Triggers the initial filtering of items based on the default active tab.
   */
  ngOnInit(): void { this.applyFilter(); }

  /**
   * Filters the list of items based on the currently selected tab.
   *
   * Uses the CotizacionesService to retrieve items matching the active status
   * and updates the local items collection.
   */
  applyFilter(): void { this.items = this.svc.filterByStatus(this.activeTab); }

  /**
   * Counts the number of quotations based on states
   *
   * Uses the CotizacionesService to retrieve amount of records for each state
   * @param status
   */
  count(status: string): number { return this.svc.countByStatus(status); }

  /**
   * Redirects to quotation-details view
   *
   * Uses a quotation object and its id to redirect
   * @param item
   */
  goToChecking(item: Quotation): void {
    this.router.navigate(['/cotizaciones', item.id, 'checking']);
  }

}
