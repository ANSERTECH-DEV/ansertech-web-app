import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryComponent } from './inventory/inventory.component';

@NgModule({
  declarations: [InventoryComponent],
  imports: [
    CommonModule,
    FormsModule,
    CheckboxModule,
    SliderModule,
    InputTextModule,
    FloatLabelModule,
    ButtonModule,
    CardModule,
    InventoryRoutingModule,
  ]
})
export class InventoryModule { }
