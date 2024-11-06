import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { resources } from 'angularx';
import * as csv from 'csvtojson';
import { currency, locale } from 'locale-service';
import { phonecodes } from 'phonecodes';
import { alertError, confirm, resources as uiplusResources } from 'ui-alert';
import { loading } from 'ui-loading';
import { UIService, formatFax, formatNumber, formatPhone, resources as uiresources } from 'ui-plus';
import { toast } from 'ui-toast';
import { storage } from 'uione';
import { resources as vresources } from 'validation-core';
import { DefaultCsvService, resources as clientresources } from 'web-clients';
import { resources as locales } from './shared/resources';

@Component({
  selector: 'app-root',
  template: '<div><router-outlet></router-outlet></div>',
})
export class AppComponent implements OnInit {
  constructor(private router: Router) { }

  ngOnInit(): void {
    clientresources.csv = new DefaultCsvService(csv);
    storage.authentication = '';
    storage.home = 'users';
    storage.setResources(locales);
    storage.setLoadingService(loading);
    storage.setUIService(new UIService());

    storage.currency = currency;
    storage.locale = locale;
    storage.alert = alertError;
    storage.confirm = confirm;
    storage.message = toast;

    vresources.phonecodes = phonecodes;
    uiresources.currency = currency;
    uiresources.resource = storage.resource();
    resources.formatPhone = formatPhone;
    resources.formatFax = formatFax;
    resources.currency = currency as any;
    resources.formatNumber = formatNumber;
    /*
    if (location.href.startsWith(storage.getRedirectUrl())) {
      window.location.href = location.origin + '/connect/oauth2' + location.search;
    }
*/
    const res = storage.getResource()
    uiplusResources.confirmHeader = res.confirm
    uiplusResources.leftText = res.no
    uiplusResources.rightText = res.yes
    uiplusResources.errorHeader = res.error
    uiplusResources.warningHeader = res.warning
    uiplusResources.infoHeader = res.info
    uiplusResources.successHeader = res.success
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        return;
      }
      window.scrollTo(0, 0);
    });
  }
}

