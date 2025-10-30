import { Component, inject, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { EditorComponent } from '../component/editor/editor.component';
import { ToolbarComponent } from '../component/toolbar/toolbar.component';
import { WelcomeDialogComponent } from '../component/welcome-dialog/welcome-dialog.component';
import { SettingStore } from '../store/setting.store';

@Component({
  imports: [EditorComponent, ToolbarComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  host: {
    class: 'h-screen flex',
  },
})
export class AppComponent implements OnInit {
  private settingStore = inject(SettingStore);
  private matDialog = inject(MatDialog);

  public ngOnInit(): void {
    const showWelcomeDialogWhenStart =
      this.settingStore.showWelcomeDialogWhenStart();
    if (showWelcomeDialogWhenStart) {
      this.matDialog.open(WelcomeDialogComponent, {
        disableClose: true,
      });
    }
  }
}
