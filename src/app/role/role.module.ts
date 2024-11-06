import { CommonModule } from "@angular/common"
import { Component, NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { RouterModule, Routes } from "@angular/router"
import { PaginationModule } from "ngx-bootstrap/pagination"
import { ModalModule } from "../shared/modal/modal.module"
import { RoleAssignmentsComponent } from "./role-assignments.component"
import { RoleComponent } from "./role.components"
import { RolesComponent } from "./roles.components"
import { MasterDataClient } from "./service/master-data"
import { RoleClient } from "./service/role"
import { UserClient } from "./service/user"
import { UsersLookupComponent } from "./users-lookup.component"

@Component({
  selector: "app-role-module",
  template: "<router-outlet></router-outlet>",
})
export class AppRoleComponent {
  constructor() {}
}

const roleRoutes: Routes = [
  {
    path: "",
    component: AppRoleComponent,
    children: [
      { path: "", component: RolesComponent },
      { path: "admin/roles", redirectTo: "roles" },
      { path: "new", component: RoleComponent },
      { path: ":id", component: RoleComponent },
      { path: "assign/:id", component: RoleAssignmentsComponent },
    ],
  },
]

@NgModule({
  imports: [RouterModule.forChild(roleRoutes)],
  declarations: [],
  exports: [RouterModule],
})
export class RoleRoutes {}

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
  declarations: [AppRoleComponent, RolesComponent, RoleComponent, RoleAssignmentsComponent, UsersLookupComponent],
  entryComponents: [],
  providers: [RoleClient, MasterDataClient, UserClient],
})
export class RoleModule {}
