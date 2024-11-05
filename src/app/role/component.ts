import { Component } from '@angular/core';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleAssignmentsComponent } from './role-assignments.component';
import { RoleComponent } from './role.components';
import { RolesComponent } from './roles.components';

@Component({
  selector: 'app-role-module',
  template: '<router-outlet></router-outlet>'
})
export class GRoleComponent {
  constructor() { }
}

const adminRoutes: Routes = [
  {
    path: '',
    component: GRoleComponent,
    children: [
      { path: '', component: RolesComponent },
      { path: 'admin/roles', redirectTo: 'roles' },
      { path: 'new', component: RoleComponent },
      { path: ':id', component: RoleComponent },
      { path: 'assign/:id', component: RoleAssignmentsComponent },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(adminRoutes)
  ],
  declarations: [

  ],
  exports: [
    RouterModule,
  ]
})
export class RoleRoutes { }
