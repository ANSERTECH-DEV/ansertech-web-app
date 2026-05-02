import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from './footer/footer.component';
import { MenuComponent } from './menu/menu.component';
import {ToolbarModule} from "primeng/toolbar";

@NgModule({
  declarations: [FooterComponent, MenuComponent],
  exports: [MenuComponent, FooterComponent],
  imports: [CommonModule, RouterModule, ToolbarModule]
})
export class ComponentsModule { }
