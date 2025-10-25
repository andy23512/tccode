import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconGuardPipe } from '../pipe/icon-guard.pipe';
import { DeviceStore } from '../store/device.store';
import { LogoComponent } from './logo.component';

@Component({
  imports: [
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    IconGuardPipe,
    LogoComponent,
  ],
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  host: {
    class: 'flex flex-col',
  },
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
