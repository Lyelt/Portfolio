import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertMilliseconds'
})
export class ConvertMillisecondsPipe implements PipeTransform {

  transform(ms: number): string {
    const seconds = ms / 1000;
    if (seconds > 60) {
      const minutes = seconds / 60;
      const leftoverSeconds = seconds % 60;
      return `${Math.trunc(minutes)}:${leftoverSeconds.toPrecision(2)}`;
    }

    return `${seconds.toPrecision(2)}s`; // TODO: figure out frames if < 1s ?
  }

}
