import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { SettingStore } from '../../store/setting.store';

@Component({
  imports: [MatDialogModule, MatButtonModule, MatCheckboxModule],
  selector: 'app-welcome-dialog',
  templateUrl: './welcome-dialog.component.html',
})
export class WelcomeDialogComponent {
  private settingStore = inject(SettingStore);
  public showWelcomeDialogWhenStart =
    this.settingStore.showWelcomeDialogWhenStart;

  public setShowWelcomeDialogWhenStart(value: boolean) {
    this.settingStore.set('showWelcomeDialogWhenStart', value);
  }
}
