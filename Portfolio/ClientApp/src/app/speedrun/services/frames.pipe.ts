import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'frames'
})
export class FramesPipe implements PipeTransform {

  transform(value: number): number {
    return Math.ceil((value / 1000) * 29.97);
  }

}
