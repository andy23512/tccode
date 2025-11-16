import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { SAMPLE_CHORD_LISTS } from '../../data/sample-chords.const';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { ChordLoaderService } from '../../service/chord-loader.service';
import { ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';
import { SettingStore } from '../../store/setting.store';

@Component({
  selector: 'app-load-button',
  templateUrl: 'load-button.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IconGuardPipe,
    MatIconModule,
    MatMenuModule,
    ToolbarButtonComponent,
  ],
})
export class LoadButtonComponent {
  private settingStore = inject(SettingStore);
  public editorLocked = this.settingStore.editorLocked;
  private chordLoaderService = inject(ChordLoaderService);
  private fileInput =
    viewChild.required<ElementRef<HTMLInputElement>>('fileInput');

  public loadFromDevice() {
    this.chordLoaderService.loadFromDevice();
  }

  public openFileSelectionDialog() {
    this.fileInput().nativeElement.click();
  }

  public onFileInputChange() {
    if (typeof FileReader === 'undefined') {
      return;
    }
    const fileInputElement = this.fileInput().nativeElement;
    if (
      fileInputElement.files === null ||
      fileInputElement.files.length === 0
    ) {
      return;
    }
    const file = fileInputElement.files[0];
    this.chordLoaderService.loadFromFile(file);
  }

  public loadSample(index: keyof typeof SAMPLE_CHORD_LISTS) {
    this.chordLoaderService.loadSample(index);
  }
}
