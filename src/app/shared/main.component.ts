import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { navigate } from 'angularx';
import { user as getUser, storage, UserAccount } from 'uione';
import { collapseAll, expandAll, toggleMenuItem } from './nav';

@Component({
  selector: 'app-main',
  templateUrl: './main.html',
  // styleUrls: [
  //       '../css/angular-material-override.css',
  //       '../css/mine.css',
  //       '../css/custome-style.css',
  //       '../css/mine-mobile.css',
  //       '../css/theme-mobile.css'
  //       ]
  // providers: [SignoutServiceImpl],
})
export class MainComponent implements OnInit {
  constructor(protected router: Router) {
    // this.signoutService = signoutService;
  }
  sysBody: HTMLElement | null | undefined;
  resource = storage.getResource();
  logInUser: any = { userId: 1 };
  isShowSearchResult = false;
  forms: any;
  privileges: any;
  isToggleSidebar?: boolean;
  isToggleMenu?: boolean;
  isToggleSearch?: boolean;
  pinnedModules: any = [];
  isMenu?: boolean;
  DarkMode?: boolean;
  isPinned?: boolean;
  classicMenu?: boolean;
  // signoutService: SignoutService;
  se: any = {};
  pageSize = 10;
  pageSizes = [10, 20, 40, 60, 100, 200, 400, 10000];
  public classProfile: any = '';
  username: string = '';
  user?: UserAccount|null = getUser();
  ngOnInit() {
    this.privileges = storage.privileges();
    this.isMenu = false;
    this.DarkMode = false;
    this.isToggleSidebar = false;
    this.isToggleMenu = false;
    this.isToggleSearch = false;
    const usr = storage.user();
    if (usr) {
      this.username = usr.displayName && usr.displayName.length > 0 ? usr.displayName : (usr.username && usr.username.length > 0 ? usr.username : this.resource.my_profile);
    }
  }

  searchOnClick() {
    // alert('test');
  }
  toggleSidebar() {
    this.isToggleSidebar = !this.isToggleSidebar;

  }
  changeClassicMenu() {
    if (!this.sysBody) {
      this.sysBody = document.getElementById('sysBody');
    }
    if (this.sysBody) {
      if (this.sysBody.classList.contains('classic')) {
        this.sysBody.classList.remove('classic');
        this.classicMenu = true;
      } else {
        this.sysBody.classList.add('classic');
        this.classicMenu = false;
      }
    }
  };
  toggleMenuProfile() {
    if (!this.logInUser) {
      navigate(this.router, 'signin');
    }
    this.classProfile = this.classProfile === 'show' ? '' : 'show';
  }
  onShowAllMenu = (e: any) => {
    e.preventDefault();
    expandAll(e.currentTarget);
  }
  onHideAllMenu = (e: any) => {
    e.preventDefault();
    collapseAll(e.currentTarget);
  }
  signout() {
    /*
    this.signoutService.signout(GlobalApps.getUserName()).subscribe(success => {
      if (success === true) {
        navigate(this.router, 'signin');
      }
    }, err => {
      this.handleError(err);
    });
    */
    /*
     const url = config.authenticationServiceUrl + '/authentication/signout/' + GlobalApps.getUserName();
     WebClientUtil.get(this.http, url).subscribe(
       success => {
         if (success) {
           sessionStorage.setItem('authService', null);
           sessionStorage.clear();
           GlobalApps.setUser(null);
           navigate(this.router, 'signin');
         }
       },
       err => this.handleError(err)
     );
     */
    sessionStorage.removeItem('authService');
    sessionStorage.clear();
    storage.setUser(null);
    navigate(this.router, '');
  }
  isClassicMenu(): boolean {
    if (!this.sysBody) {
      this.sysBody = document.getElementById('sysBody');
    }
    if (this.sysBody) {
      if (this.sysBody.classList.contains('classic')) {
        return true;
      }
    }
    return false;
  }
  changeMenu() {
    if (!this.sysBody) {
      this.sysBody = document.getElementById('sysBody');
    }
    if (this.sysBody) {
      if (this.sysBody.classList.contains('top-menu')) {
        this.sysBody.classList.remove('top-menu');
        this.isMenu = true;
      } else {
        this.sysBody.classList.add('top-menu');
        this.isMenu = false;
      }
    }
  }
  changeMode() {
    if (!this.sysBody) {
      this.sysBody = document.getElementById('sysBody');
    }
    if (this.sysBody) {
      const parent = this.sysBody.parentElement;
      if (parent) {
        if (parent.classList.contains('dark')) {
          parent.classList.remove('dark');
          this.DarkMode = false;
        } else {
          parent.classList.add('dark');
          this.DarkMode = true;
        }
      }
    }
  }
  isTopMenu(): boolean {
    if (!this.sysBody) {
      this.sysBody = document.getElementById('sysBody');
    }
    if (this.sysBody) {
      if (this.sysBody.classList.contains('top-menu')) {
        return true;
      }
    }
    return false;
  }

  isDarkMode(): boolean {
    if (!this.sysBody) {
      this.sysBody = document.getElementById('sysBody');
    }
    if (this.sysBody) {
      const parent = this.sysBody.parentElement;
      if (parent) {
        if (parent.classList.contains('dark')) {
          return true;
        }
      }
    }
    return false;
  }
  toggleMenuItem = (event: any) => {
    event.preventDefault();
    toggleMenuItem(event.currentTarget);
  }
  expandAll(e: any) {
    e.preventDefault();
    expandAll(e.currentTarget);
  }
  pinModulesHandler(event: any, index: any, moduleOrder: any) {
    event.stopPropagation();
    if (
      this.privileges.find(
        (module: any) => module.sequence === moduleOrder)
    ) {
      const removedModule = this.privileges.splice(index, 1);
      this.pinnedModules.push(removedModule[0]);
      this.privileges.sort(
        (moduleA: any, moduleB: any) => moduleA.sequence - moduleB.sequence
      );
    } else {
      if (this.pinnedModules.length > 0) {
        const removedModule = this.pinnedModules.splice(index, 1);
        this.privileges.push(removedModule[0]);
        this.privileges.sort((moduleA: any, moduleB: any) => moduleA.sequence - moduleB.sequence);
      }

    }
  }

  routeIsActive(routePath: string, params: any) {
    //  let currentRoute = this.router.urlTree.firstChild(this.router.urlTree.root);
    //  // e.g. 'Login' or null if route is '/'
    //  let segment = !currentRoute ? '/' : currentRoute.segment;
    //  return  segment == routePath;
    return false;
  }
  toggleMenu() {

    this.isToggleMenu = !this.isToggleMenu;
  }
  gotoURL(url: string) {
    navigate(this.router, url);
  }

  activeWithPath(path: string) {
    return this.router.url === path ? 'active' : '';
  }
  viewMyProfile() {
    navigate(this.router, 'my-profile');
  }

  viewMySettings() {
    navigate(this.router, 'my-profile/settings');
  }
}
