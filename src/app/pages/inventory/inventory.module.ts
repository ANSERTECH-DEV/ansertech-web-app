import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InventoryRoutingModule } from './inventory-routing.module';
import { InventoryComponent } from './inventory/inventory.component';
import {SliderModule} from "primeng/slider";

@NgModule({
  declarations: [InventoryComponent],
  imports: [CommonModule, FormsModule, CheckboxModule, InventoryRoutingModule, SliderModule]
})
export class InventoryModule { }
