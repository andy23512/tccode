import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconGuardPipe } from '../pipe/icon-guard.pipe';
import { DeviceStore } from '../store/device.store';

@Component({
  imports: [MatButtonModule, MatIconModule, MatTooltipModule, IconGuardPipe],
  selector: 'app-connect-button',
  templateUrl: './connect-button.component.html',
})
export class ConnectButtonComponent {
  public deviceStore = inject(DeviceStore);
  public deviceConnected = this.deviceStore.isConnected;

  public isWebSerialApiSupported = 'serial' in navigator;

  public async connect() {
    await this.deviceStore.connect();
    await this.deviceStore.loadChord();
  }

  public async disconnect() {
    this.deviceStore.disconnect();
  }
}
