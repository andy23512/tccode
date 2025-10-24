import { Pipe, PipeTransform } from '@angular/core';
import { Icon } from '../model/icon.model';

@Pipe({
  name: 'iconGuard',
  standalone: true,
})
export class IconGuardPipe implements PipeTransform {
  transform<T extends Icon>(value: T): T {
    return value;
  }
}
