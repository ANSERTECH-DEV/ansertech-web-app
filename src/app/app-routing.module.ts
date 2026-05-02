import { NgModule } from '@angular/core';
import { RouterModule, Routes, ExtraOptions } from '@angular/router';
import { BlankComponent } from './layouts/blank/blank.component';
import { MainComponent } from './layouts/main/main.component';
import { AuthGuard } from './guards/auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: BlankComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./pages/authentication/authentication.module').then(m => m.AuthenticationModule)
      }
    ]
  },
  {
    path: '',
    component: MainComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'cotizaciones', pathMatch: 'full' },
      {
        path: 'cotizaciones',
        loadChildren: () => import('./pages/quotations/quotations.module').then(m => m.QuotationsModule),
      },
      {
        path: 'inventario',
        loadChildren: () => import('./pages/inventory/inventory.module').then(m => m.InventoryModule),
      },
      {
        path: 'dashboard',
        loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardModule),
      }
    ]
  },
  { path: '**', redirectTo: 'login' }
];

const routerOptions: ExtraOptions = { useHash: true };

@NgModule({
  imports: [RouterModule.forRoot(routes, routerOptions)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
