import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { OutlookConnectionComponent } from './outlook-connection/outlook-connection.component';
import { ParametersComponent } from './parameters/parameters.component';


@NgModule({
  declarations: [
    DashboardComponent,
    OutlookConnectionComponent,
    ParametersComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DashboardRoutingModule
  ]
})
export class DashboardModule { }
