import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'stringToArray'})
export class StringToArrayPipe implements PipeTransform {
  transform(value: string) {
    if (value === '' || !value) {
      return [];
    } else {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
      // const replace = value.replace(/'/g, '"');
    }
  }
}
