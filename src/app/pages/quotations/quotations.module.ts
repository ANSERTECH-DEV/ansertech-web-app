import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { QuotationsRoutingModule } from './quotations-routing.module';
import { PendingListComponent } from './pending-list/pending-list.component';
import { ReviewDetailComponent } from './review-detail/review-detail.component';
import {SelectButtonModule} from "primeng/selectbutton";
import {FormsModule} from "@angular/forms";
import {TableModule} from "primeng/table";
import {TagModule} from "primeng/tag";

@NgModule({
  declarations: [PendingListComponent, ReviewDetailComponent],
  imports: [CommonModule, RouterModule, QuotationsRoutingModule, SelectButtonModule, FormsModule, TableModule, TagModule]
})
export class QuotationsModule { }
