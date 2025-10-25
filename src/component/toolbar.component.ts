import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconGuardPipe } from '../pipe/icon-guard.pipe';
import { DeviceStore } from '../store/device.store';

@Component({
  imports: [MatListModule, MatIconModule, MatTooltipModule, IconGuardPipe],
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
})
export class ToolbarComponent {
  public deviceStore = inject(DeviceStore);
  public deviceConnected = this.deviceStore.isConnected;

  public isWebSerialApiSupported = 'serial' in navigator;

  public async connect() {
    this.deviceStore.connect();
  }

  public async disconnect() {
    this.deviceStore.disconnect();
  }
}
