import { Component, ContentChild, OnDestroy, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
})
export class ModalComponent implements OnDestroy {
  @ContentChild('header', { static: false }) 
  header?: TemplateRef<any>;
  @ContentChild('body', { static: false }) 
  body?: TemplateRef<any>;
  @ContentChild('footer', { static: false }) 
  footer?: TemplateRef<any>;

  public visible = false;
  public visibleAnimate = false;

  ngOnDestroy() {
    // Prevent modal from not executing its closing actions if the user navigated away (for example,
    // through a link).
    this.close();
  }

  open(): void {    
    document.body.style.overflow = 'hidden';

    this.visible = true;
    setTimeout(() => this.visibleAnimate = true, 200);
  }

  close(): void {
    document.body.style.overflow = 'auto';

    this.visibleAnimate = false;
    setTimeout(() => this.visible = false, 100);
  }

  onContainerClicked(event: MouseEvent): void {
    if ((<HTMLElement>event.target).classList.contains('modal')) {
      this.close();
    }
  }
}
