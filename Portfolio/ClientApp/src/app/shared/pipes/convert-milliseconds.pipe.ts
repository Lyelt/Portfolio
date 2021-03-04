import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertMilliseconds'
})
export class ConvertMillisecondsPipe implements PipeTransform {

  transform(ms: number): string {
    if (ms === 0) return "0";

    const seconds = Math.abs(ms) / 1000;
    let time = `${seconds.toFixed(2)}`;

    if (seconds > 60) {
      const minutes = seconds / 60;
      const leftoverSeconds = seconds % 60;
      time = `${Math.trunc(minutes)}:${leftoverSeconds.toFixed(2)}`;

      if (minutes > 60) {
        const hours = minutes / 60;
        const leftoverMinutes = minutes % 60;
        time = `${Math.trunc(hours)}:${Math.trunc(leftoverMinutes)}:${leftoverSeconds.toFixed(2)}`
      }
    }

    return ms < 0 ? "-" + time : "+" + time; 
  }

}
