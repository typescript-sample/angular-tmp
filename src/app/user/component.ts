import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserComponent } from './user.component';
import { UsersComponent } from './users.component';

@Component({
  selector: 'app-user-module',
  template: '<router-outlet></router-outlet>'
})
export class GUserComponent {
  constructor() { }
}

const userRoutes: Routes = [
  {
    path: '',
    component: GUserComponent,
    children: [
      { path: '', component: UsersComponent },
      { path: 'new', component: UserComponent },
      { path: ':id', component: UserComponent },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(userRoutes)
  ],
  declarations: [

  ],
  exports: [
    RouterModule,
  ]
})
export class UserRoutes { }
