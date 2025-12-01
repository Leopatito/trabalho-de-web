import { Routes } from '@angular/router';
import { Login } from './features/users/components/login/login';
import { Register } from './features/users/components/register/register';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { CategoriesListComponent } from './features/categories/categories-list.component';

export const routes: Routes = [
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'register',
    component: Register,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'categories',
    component: CategoriesListComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadComponent: () =>
      import('./features/users/pages/profile.component')
        .then(m => m.ProfileComponent),
    canActivate: [AuthGuard],
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard',
  },
  {
    path: 'accounts/:id/statement',
    loadComponent: () =>
      import('./accounts/pages/account-statement/account-statement.component')
        .then(m => m.AccountStatementComponent)
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./accounts/account-routing.module')
        .then(m => m.AccountsRoutingModule),
  },
  {
    path: 'goals',
    loadComponent: () =>
      import('./accounts/pages/goals-page/goals-page.component')
        .then(m => m.GoalsPageComponent)
  },
  {
    path: 'transactions',
    loadComponent: () =>
      import('./transactions/pages/transactions-list.component')
        .then(m => m.TransactionsListComponent),
    canActivate: [AuthGuard],
  },
];
