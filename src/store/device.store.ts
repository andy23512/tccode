import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { Device } from '../model/device.model';
import { SerialService } from '../service/serial.service';

const initialState: Device = {
  isConnected: false,
  version: '',
  id: '',
};

export const DeviceStore = signalStore(
  { providedIn: 'root' },
  withDevtools('device'),
  withState(initialState),
  withMethods((store, serialService = inject(SerialService)) => ({
    async connect(): Promise<void> {
      const { version, id } = await serialService.connect();
      patchState(store, { version, id, isConnected: true });
    },
    async disconnect(): Promise<void> {
      await serialService.disconnect();
      patchState(store, initialState);
    },
  }))
);
