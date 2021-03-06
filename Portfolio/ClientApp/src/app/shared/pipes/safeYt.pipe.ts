import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'safeYt'
})
export class SafeYtPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {
    
  }

  transform(watchCodeOrUrl) {
    if (!watchCodeOrUrl) return;
    
    if (watchCodeOrUrl.startsWith('https://')) {
      if (watchCodeOrUrl.includes('/watch?v='))
        watchCodeOrUrl = watchCodeOrUrl.substring(watchCodeOrUrl.lastIndexOf('=') + 1);
      else
        watchCodeOrUrl = watchCodeOrUrl.substring(watchCodeOrUrl.lastIndexOf('/') + 1);
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/' + watchCodeOrUrl);
  }

}
