import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {RouterModule, Routes} from '@angular/router';
import {AuthenticationComponent} from './authentication.component';
import {AuthenticationClient} from './AuthenticationClient';
import {SigninComponent} from './signin.component';

const authenticationRoutes: Routes = [
  {
    path: '',
    component: AuthenticationComponent,
    children: [
      {path: '', component: SigninComponent},
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(authenticationRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class AuthenticationRoutes {
}


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    AuthenticationRoutes,
    ReactiveFormsModule
  ],
  declarations: [
    AuthenticationComponent,
    SigninComponent
  ],
  entryComponents: [],
  providers: [
    AuthenticationClient
  ]
})
export class AuthenticationModule {
}
