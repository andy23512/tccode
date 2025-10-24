import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatTooltipModule } from '@angular/material/tooltip';
import { IconGuardPipe } from '../pipe/icon-guard.pipe';
import { SerialService } from '../service/serial.service';

@Component({
  imports: [MatListModule, MatIconModule, MatTooltipModule, IconGuardPipe],
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
})
export class ToolbarComponent {
  public serialService = inject(SerialService);

  public isWebSerialApiSupported = 'serial' in navigator;

  public async connectToCharaChorderDevice() {
    const d = await this.serialService.connect();
    console.log(d);
  }
}
