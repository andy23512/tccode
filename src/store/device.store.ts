import { withDevtools } from '@angular-architects/ngrx-toolkit';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { lastValueFrom, tap } from 'rxjs';
import { Device } from '../model/device.model';
import { SerialService } from '../service/serial.service';

const initialState: Device = {
  isConnected: false,
  version: '',
  id: '',
  chordLibraryLoadStatus: null,
  chordLibrary: null,
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
    async loadChord(): Promise<void> {
      return lastValueFrom(
        serialService.loadChords().pipe(
          tap((loadProgress) => {
            patchState(store, {
              rawChordLibraryLoadStatus: { ...loadProgress },
              ...(loadProgress.rawChords
                ? { rawChordLibrary: { chords: loadProgress.rawChords } }
                : {}),
            });
          }),
        ),
      ).then(() => {
        return;
      });
    },
    async disconnect(): Promise<void> {
      await serialService.disconnect();
      patchState(store, initialState);
    },
  })),
);
