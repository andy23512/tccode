import { Component, inject, OnInit } from '@angular/core';
import { ChordEditorComponent } from '../component/chord-editor.component';
import { ToolbarComponent } from '../component/toolbar.component';
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

  public ngOnInit(): void {
    const showWelcomeDialogWhenStart =
      this.settingStore.showWelcomeDialogWhenStart();
    if (showWelcomeDialogWhenStart) {
      console.log('show');
    }
  }
}
