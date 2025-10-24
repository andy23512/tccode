import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconGuardPipe } from '../pipe/icon-guard.pipe';

@Component({
  imports: [MatListModule, MatIconModule, MatTooltipModule, IconGuardPipe],
  selector: 'app-toolbar',
  templateUrl: './toolbar.html',
})
export class ToolbarComponent {}
