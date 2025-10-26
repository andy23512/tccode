import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ChordEditorComponent } from '../component/chord-editor/chord-editor.component';
import { ToolbarComponent } from '../component/toolbar/toolbar.component';
import { WelcomeDialogComponent } from '../component/welcome-dialog/welcome-dialog.component';
import { SettingStore } from '../store/setting.store';

@Component({
  imports: [ChordEditorComponent, ToolbarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  host: {
    class: 'h-screen flex',
  },
})
export class AppComponent implements OnInit {
  public settingStore = inject(SettingStore);
  public matDialog = inject(MatDialog);

  public ngOnInit(): void {
    const showWelcomeDialogWhenStart =
      this.settingStore.showWelcomeDialogWhenStart();
    if (showWelcomeDialogWhenStart) {
      this.matDialog.open(WelcomeDialogComponent, {
        disableClose: true,
        panelClass: 'shadow-sm shadow-white'.split(' '),
      });
    }
  }
}
