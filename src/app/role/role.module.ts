import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from '../shared/modal/modal.module';
import { GRoleComponent, RoleRoutes } from './component';
import { RoleAssignmentsComponent } from './role-assignments.component';
import { RoleComponent } from './role.components';
import { RolesComponent } from './roles.components';
import { MasterDataClient } from './service/master-data';
import { RoleClient } from './service/role';
import { UserClient } from './service/user';
import { UsersLookupComponent } from './users-lookup.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RoleRoutes,
    ReactiveFormsModule,
    ModalModule,
    // BsDropdownModule.forRoot(),
    PaginationModule.forRoot(),
    // BsDatepickerModule.forRoot(),
    // TimepickerModule.forRoot(),
    // OwlDateTimeModule,
    // OwlNativeDateTimeModule,
    // NgxPaginationModule
  ],
  declarations: [
    GRoleComponent,
    RolesComponent,
    RoleComponent,
    RoleAssignmentsComponent,
    UsersLookupComponent,
  ],
  entryComponents: [],
  providers: [
    RoleClient,
    MasterDataClient,
    UserClient,
  ]
})
export class RoleModule {
}

