import { Component, inject } from '@angular/core';
import { SettingStore } from '../../store/setting.store';
import { ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';

@Component({
  selector: 'app-lock-button',
  templateUrl: 'lock-button.component.html',
  imports: [ToolbarButtonComponent],
})
export class LockButtonComponent {
  private settingStore = inject(SettingStore);
  public editorLocked = this.settingStore.editorLocked;

  public toggleEditorLocked() {
    const editorLocked = this.editorLocked();
    this.settingStore.set('editorLocked', !editorLocked);
  }
}
