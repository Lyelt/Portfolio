import { SafePipe } from './safe.pipe';
import { DomSanitizer } from '@angular/platform-browser';

describe('SafePipe', () => {
  it('create an instance', () => {
    const sanitizer = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', ['bypassSecurityTrustResourceUrl']);
    const pipe = new SafePipe(sanitizer);
    expect(pipe).toBeTruthy();
  });
});
