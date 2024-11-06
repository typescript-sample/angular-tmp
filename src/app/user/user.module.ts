import { CommonModule } from "@angular/common"
import { Component, NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { RouterModule, Routes } from "@angular/router"
import { PaginationModule } from "ngx-bootstrap/pagination"
import { ModalModule } from "../shared/modal/modal.module"
import { MasterDataClient } from "./service/master-data"
import { UserClient } from "./service/user"
import { UserComponent } from "./user.component"
import { UsersComponent } from "./users.component"

@Component({
  selector: "app-user-module",
  template: "<router-outlet></router-outlet>",
})
export class AppUserComponent {
  constructor() {}
}

const userRoutes: Routes = [
  {
    path: "",
    component: AppUserComponent,
    children: [
      { path: "", component: UsersComponent },
      { path: "new", component: UserComponent },
      { path: ":id", component: UserComponent },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(userRoutes)],
  declarations: [],
  exports: [RouterModule],
})
export class UserRoutes {}

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
  declarations: [AppUserComponent, UsersComponent, UserComponent],
  providers: [MasterDataClient, UserClient],
})
export class UserModule {}
