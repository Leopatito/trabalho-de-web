import { Routes } from '@angular/router';
import { Login } from './features/users/components/login/login';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
];
