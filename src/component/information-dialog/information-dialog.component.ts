import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';

@Component({
  selector: 'app-information-dialog',
  templateUrl: 'information-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatButtonModule, MatIconModule, IconGuardPipe],
})
export class InformationDialogComponent {}
