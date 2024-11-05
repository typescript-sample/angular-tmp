import {Injectable} from '@angular/core';
import { ComponentLoaderFactory } from 'ngx-bootstrap/component-loader';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import { PositioningService } from 'ngx-bootstrap/positioning';
@Injectable()
export class PopupService {
  bsModalRef: BsModalRef | undefined;

  constructor (
    private bsModalService: BsModalService,
  ) {
  }

  show(conponent: any, item: any) {
    const initialState = { data: Object.assign({}, item)};
    return this.bsModalService.show(conponent, {
      initialState,
      class: 'modal-dialog-centered modal-dialog-log'
    });
  }
}

export const DependenciesServiceProviders = [PopupService, BsModalService, ComponentLoaderFactory, PositioningService];
