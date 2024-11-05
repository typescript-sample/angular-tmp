import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from '../shared/modal/modal.module';
import { GUserComponent, UserRoutes } from './component';
import { MasterDataClient } from './service/master-data';
import { UserClient } from './service/user';
import { UserComponent } from './user.component';
import { UsersComponent } from './users.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    UserRoutes,
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
    GUserComponent,
    UsersComponent,
    UserComponent,
  ],
  providers: [
    MasterDataClient,
    UserClient,
  ]
})
export class UserModule {
}
