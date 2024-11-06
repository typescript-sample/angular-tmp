import { CommonModule } from "@angular/common"
import { Component, NgModule } from "@angular/core"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { RouterModule, Routes } from "@angular/router"
import { AuthenticationClient } from "./AuthenticationClient"
import { SigninComponent } from "./signin.component"

@Component({
  selector: "app-authentication-module",
  template: '<div class="authentication"><router-outlet></router-outlet></div>',
})
export class AuthenticationComponent {
  constructor() {}
}

const authenticationRoutes: Routes = [
  {
    path: "",
    component: AuthenticationComponent,
    children: [{ path: "", component: SigninComponent }],
  },
]

@NgModule({
  imports: [RouterModule.forChild(authenticationRoutes)],
  exports: [RouterModule],
})
export class AuthenticationRoutes {}

@NgModule({
  imports: [CommonModule, FormsModule, AuthenticationRoutes, ReactiveFormsModule],
  declarations: [AuthenticationComponent, SigninComponent],
  entryComponents: [],
  providers: [AuthenticationClient],
})
export class AuthenticationModule {}
