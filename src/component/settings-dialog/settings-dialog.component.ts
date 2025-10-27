import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { KeyBindings } from '../../model/setting.model';
import { SettingStore } from '../../store/setting.store';

@Component({
  imports: [
    MatButtonModule,
    MatCheckboxModule,
    MatDialogModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
})
export class SettingsDialogComponent {
  public settingStore = inject(SettingStore);
  public showWelcomeDialogWhenStart =
    this.settingStore.showWelcomeDialogWhenStart;
  public keyBindings = this.settingStore.keyBindings;
  public keyBindingOptions: { label: string; value: KeyBindings }[] = [
    { label: 'Classic', value: KeyBindings.Classic },
    { label: 'Vim', value: KeyBindings.Vim },
    { label: 'Emacs', value: KeyBindings.Emacs },
  ];

  public setShowWelcomeDialogWhenStart(value: boolean) {
    this.settingStore.set('showWelcomeDialogWhenStart', value);
  }

  public setKeyBindings(value: KeyBindings) {
    this.settingStore.set('keyBindings', value);
  }
}
