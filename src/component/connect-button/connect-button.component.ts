import { Component, computed, inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DeviceStore } from '../../store/device.store';
import { ToolbarButtonComponent } from '../toolbar-button/toolbar-button.component';

@Component({
  imports: [MatProgressSpinnerModule, ToolbarButtonComponent],
  selector: 'app-connect-button',
  templateUrl: './connect-button.component.html',
})
export class ConnectButtonComponent {
  public deviceStore = inject(DeviceStore);
  public deviceConnected = this.deviceStore.isConnected;

  public isWebSerialApiSupported = 'serial' in navigator;

  public isChordLoaded = computed<boolean>(() => {
    return !!this.deviceStore.chordLibraryLoadStatus()?.complete;
  });
  public chordLoadProgress = computed<number>(() => {
    const loadStatus = this.deviceStore.chordLibraryLoadStatus();
    if (!loadStatus) {
      return 0;
    }
    return (loadStatus.loaded / loadStatus.total) * 100;
  });

  public async connect() {
    await this.deviceStore.connect();
    await this.deviceStore.loadChord();
  }

  public async disconnect() {
    this.deviceStore.disconnect();
  }
}
