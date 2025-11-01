import { Component, EventEmitter, input, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenu } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Icon } from '../../model/icon.model';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';

@Component({
  imports: [MatTooltipModule, MatButtonModule, MatIconModule, IconGuardPipe],
  selector: 'app-toolbar-button',
  templateUrl: 'toolbar-button.component.html',
})
export class ToolbarButtonComponent {
  public tooltip = input.required<string>();
  public icon = input.required<Icon>();
  public disabled = input<boolean>(false);
  public menu = input<MatMenu | null>(null);
  @Output() public buttonClick = new EventEmitter();
}
