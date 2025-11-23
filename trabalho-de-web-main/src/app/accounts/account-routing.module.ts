import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/account-list/account-list.component')
        .then(m => m.AccountsListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./pages/account-form/account-form.component')
        .then(m => m.AccountFormComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/account-form/account-form.component')
        .then(m => m.AccountFormComponent)
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/account-details/account-details.component')
        .then(m => m.AccountDetailsComponent)
  }
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountsRoutingModule {}
