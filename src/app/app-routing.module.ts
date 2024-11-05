import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationService } from './shared/AuthenticationService';
import { MainComponent } from './shared/main.component';
// import { Error404Component } from './core/error404/error-404.component';

const routes: Routes = [
  { path: '', redirectTo: '/', pathMatch: 'full' },
  { path: '', loadChildren: () => import('./authentication/authentication.module').then(m => m.AuthenticationModule) },
  {
    path: '', component: MainComponent, data: {
      title: 'Home'
    }, canActivate: [AuthenticationService], children: [
      {
        path: 'roles',
        loadChildren: () => import('./role/role.module').then(m => m.RoleModule)
      },
      {
        path: 'users',
        loadChildren: () => import('./user/user.module').then(m => m.UserModule)
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
