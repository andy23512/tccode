import { Component } from '@angular/core';
import { ConnectButtonComponent } from './connect-button.component';
import { LogoComponent } from './logo.component';

@Component({
  imports: [LogoComponent, ConnectButtonComponent],
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  host: {
    class: 'flex flex-col',
  },
})
export class ToolbarComponent {}
