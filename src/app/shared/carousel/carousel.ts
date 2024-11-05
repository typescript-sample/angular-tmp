// import { Component, Input, OnInit, QueryList, ViewChildren } from "@angular/core";
// import CarouselImageItem from "./carouselImageItem.component";
// @Component({
//     selector: '<app-carousel></app-carousel>',
//     templateUrl: './carousel.html',
//     styleUrls: ['./carousel.css']
// })
// export default class CarouselComponent implements OnInit{
//     @Input() infiniteLoop: boolean | undefined;
//     @ViewChildren(CarouselImageItem) children: QueryList<CarouselImageItem> | undefined;
//     counter: number = 0;
//     withItem: number = 0;
//     slidersLength: number = 0;
//     touchPosition: number = 0;//null
//     slider: HTMLDivElement | null = null;
//     sliderContainer: HTMLDivElement | null = null;
//     typingTimeoutRef: HTMLDivElement | null = null;
//     widthFullScreen: number = 0;//null
//     slideContentWrap: HTMLDivElement | null = null;
//     widthSlideContentWrap: number = 0;

//     ngOnInit(): void {
//         if (!this.widthFullScreen.current || !this.slideContentWrap.current) return
//         widthFullScreen.current = window.screen.width;
//         widthSlideContentWrap.current = slideContentWrap.current.offsetWidth;
//     }

//     handleResize():void {
//         if (!this.slideContentWrap.current) return
//         if (this.typingTimeoutRef.current) {
//           clearTimeout(this.typingTimeoutRef.current);
//         }
//         if (this.widthFullScreen.current === window.innerWidth && document.fullscreenElement) {
//           return;
//         }
//         if (this.widthFullScreen.current !== window.screen.width) {
//             this.widthFullScreen.current = window.screen.width;
//             this.typingTimeoutRef.current = setTimeout(() => {
//             handleWidth();
//           }, 200);
//           widthSlideContentWrap.current = slideContentWrap.current.offsetWidth;
//           return;
//         }
//         if (slideContentWrap.current && widthSlideContentWrap.current !== slideContentWrap.current.offsetWidth) {
//           typingTimeoutRef.current = setTimeout(() => {
//             handleWidth();
//           }, 200);
//           widthSlideContentWrap.current = slideContentWrap.current.offsetWidth;
//           return;
//         }
//         typingTimeoutRef.current = setTimeout(() => {
//           handleWidth();
//         }, 200);
//       };
//     handleWidth():void{
//         if (!sliderContainer.current || !slideContentWrap.current) return
//         const slideItems = sliderContainer.current.children;
//         console.log(slideContentWrap.current.offsetWidth);
//         slidersLength.current = slideItems.length;
//         widthItem.current = slideContentWrap.current.offsetWidth;
//         Array.from(slideItems).forEach((item: Element) => {
//           if (slideContentWrap && slideContentWrap.current && item instanceof HTMLElement) {
//             item.style.width = slideContentWrap.current.offsetWidth + 'px';
//           }
    
//         });
//         sliderContainer.current.style.width = widthItem.current * slidersLength.current + 'px';
//         sliderContainer.current.style.transition = 'transform 0.4s ease-in-out';
//         sliderContainer.current.style.transform =
//           'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
//       };
    
//       const handleTransitionEnd = () => {
//         if (!sliderContainer.current) return
//         if (sliderContainer.current.children[counter.current].id === 'lastClone') {
//           sliderContainer.current.style.transition = 'none';
//           counter.current = slidersLength.current - 2;
//           sliderContainer.current.style.transform =
//             'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
//         }
//         if (sliderContainer.current.children[counter.current].id === 'firstClone') {
//           sliderContainer.current.style.transition = 'none';
//           counter.current = slidersLength.current - counter.current;
//           sliderContainer.current.style.transform =
//             'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
//         }
//       };
    
//       const prev = () => {
//         if (!sliderContainer.current) return
//         if (counter.current <= 0) { return; }
//         sliderContainer.current.style.transition = 'transform 0.4s ease-in-out';
//         counter.current--;
//         sliderContainer.current.style.transform =
//           'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
//         clearVideo();
//       };
    
//       const next = () => {
//         if (!sliderContainer.current) return
//         if (counter.current >= slidersLength.current - 1) { return; }
//         sliderContainer.current.style.transition = 'transform 0.4s ease-in-out';
//         counter.current++;
//         sliderContainer.current.style.transform =
//           'translate3d(' + -widthItem.current * counter.current + 'px, 0px, 0px)';
//         clearVideo();
//       };
    
// }