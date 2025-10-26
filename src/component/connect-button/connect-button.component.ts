import { Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconGuardPipe } from '../../pipe/icon-guard.pipe';
import { DeviceStore } from '../../store/device.store';

@Component({
  imports: [
    IconGuardPipe,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
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
