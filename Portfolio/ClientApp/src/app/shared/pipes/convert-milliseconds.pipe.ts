import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'convertMilliseconds'
})
export class ConvertMillisecondsPipe implements PipeTransform {

  transform(ms: number): string {
    if (ms === 0) return "0";

    const seconds = Math.abs(ms) / 1000;
    let time = `${this.fixedAndPad(seconds)}`;

    if (seconds > 60) {
      const minutes = seconds / 60;
      const leftoverSeconds = seconds % 60;
      time = `${this.truncateAndPad(minutes)}:${this.fixedAndPad(leftoverSeconds)}`;

      if (minutes > 60) {
        const hours = minutes / 60;
        const leftoverMinutes = minutes % 60;
        time = `${this.truncateAndPad(hours)}:${this.truncateAndPad(leftoverMinutes)}:${this.fixedAndPad(leftoverSeconds)}`
      }
    }

    return ms < 0 ? "-" + time : "+" + time; 
  }

  truncateAndPad(num: number): string {
    return Math.trunc(num).toString().padStart(2, "0");
  }

  fixedAndPad(num: number): string {
    return num.toFixed(2).toString().padStart(5, "0");
  }
}
