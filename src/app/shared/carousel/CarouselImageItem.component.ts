import { Component, Input } from "@angular/core";

@Component({
    selector:'carousel-image-item',
    template:"<img class='image-carousel' [src]='url' [alt]='url' draggable='false' />"
})
export default class CarouselImageItem{
    @Input()url:string|undefined;
}