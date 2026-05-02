import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PendingListComponent } from './pending-list/pending-list.component';
import { ReviewDetailComponent } from './review-detail/review-detail.component';

const routes: Routes = [
  { path: '', component: PendingListComponent },
  { path: ':id/checking', component: ReviewDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuotationsRoutingModule { }
