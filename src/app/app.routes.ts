// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { authGuard } from './guard/auth.guard';
import { CreditosComponent } from './components/creditos/creditos.component';
import { InventoryComponent } from './components/inventory/inventory.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: DashboardComponent,
    canActivate: [authGuard],
    children: [
      { path: 'inventories', component: InventoryComponent },  // 
      { path: 'creditos', component: CreditosComponent },
      { path: '', redirectTo: 'inventories', pathMatch: 'full' } // 
    ]
  },
  { path: '**', redirectTo: '' }
];