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
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        return;
      }
      if (file.name.endsWith('.json')) {
        this.chordLoaderService.loadFromJson(result);
      } else {
        this.chordLoaderService.loadFromText(result);
      }
    };

    reader.readAsText(fileInputElement.files[0]);
  }

  public loadSample(index: keyof typeof SAMPLE_CHORD_LISTS) {
    this.chordLoaderService.loadSample(index);
  }
}
