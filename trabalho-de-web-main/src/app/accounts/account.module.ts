import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccountsRoutingModule } from './account-routing.module';

import { AccountsListComponent } from './pages/account-list/account-list.component';
import { AccountFormComponent } from './pages/account-form/account-form.component';
import { AccountDetailsComponent } from './pages/account-details/account-details.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccountsRoutingModule,

    AccountsListComponent,
    AccountFormComponent,
    AccountDetailsComponent,
  ],
})
export class AccountsModule {}
