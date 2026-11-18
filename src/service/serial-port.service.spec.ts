import { TestBed } from '@angular/core/testing';
import { CHARACHORDER_DEVICE_PORTS } from '../data/charachorder-device-ports.const';
import { SettingStore } from '../store/setting.store';
import { SerialPortService } from './serial-port.service';

const fakePort = (usbVendorId?: number, usbProductId?: number) =>
  ({
    getInfo: () => ({ usbVendorId, usbProductId }),
  }) as unknown as SerialPort;

describe('SerialPortService', () => {
  const requestPort = jest.fn();
  const getPorts = jest.fn();
  let service: SerialPortService;
  let settings: InstanceType<typeof SettingStore>;
  const requested = fakePort(1, 1);

  beforeAll(() => {
    Object.defineProperty(navigator, 'serial', {
      value: { requestPort, getPorts },
      configurable: true,
    });
  });

  afterAll(() => {
    delete (navigator as unknown as { serial?: unknown }).serial;
  });

  beforeEach(() => {
    localStorage.clear();
    requestPort.mockReset().mockResolvedValue(requested);
    getPorts.mockReset().mockResolvedValue([]);
    service = TestBed.inject(SerialPortService);
    settings = TestBed.inject(SettingStore);
  });

  const [oneM0, twoS3] = [
    CHARACHORDER_DEVICE_PORTS.get('ONE M0') as SerialPortFilter,
    CHARACHORDER_DEVICE_PORTS.get('TWO S3') as SerialPortFilter,
  ];
  const charaPort = (filter: SerialPortFilter) =>
    fakePort(filter.usbVendorId, filter.usbProductId);

  describe('auto connect disabled (default)', () => {
    it('asks the user to pick a port, filtered to CharaChorder devices', async () => {
      expect(await service.getPort()).toBe(requested);
      expect(requestPort).toHaveBeenCalledWith({
        filters: [...CHARACHORDER_DEVICE_PORTS.values()],
      });
    });

    it('does not look at already granted ports', async () => {
      getPorts.mockResolvedValue([charaPort(oneM0)]);
      await service.getPort();
      expect(getPorts).not.toHaveBeenCalled();
      expect(requestPort).toHaveBeenCalledTimes(1);
    });
  });

  describe('auto connect enabled', () => {
    beforeEach(() => {
      settings.set('autoConnectToDevice', true);
    });

    it('uses the only viable granted port without prompting', async () => {
      const port = charaPort(oneM0);
      getPorts.mockResolvedValue([port]);
      expect(await service.getPort()).toBe(port);
      expect(requestPort).not.toHaveBeenCalled();
    });

    it('ignores granted ports that are not CharaChorder devices', async () => {
      const port = charaPort(twoS3);
      getPorts.mockResolvedValue([fakePort(0x1234, 0x5678), port]);
      expect(await service.getPort()).toBe(port);
      expect(requestPort).not.toHaveBeenCalled();
    });

    it('requires both vendor and product id to match', async () => {
      getPorts.mockResolvedValue([
        fakePort(twoS3.usbVendorId, 0x0001),
        fakePort(0x0001, twoS3.usbProductId),
      ]);
      expect(await service.getPort()).toBe(requested);
      expect(requestPort).toHaveBeenCalledTimes(1);
    });

    it('prompts when there is no viable granted port', async () => {
      expect(await service.getPort()).toBe(requested);
      expect(requestPort).toHaveBeenCalledTimes(1);
    });

    it('prompts when more than one viable port is granted', async () => {
      getPorts.mockResolvedValue([charaPort(oneM0), charaPort(twoS3)]);
      expect(await service.getPort()).toBe(requested);
      expect(requestPort).toHaveBeenCalledTimes(1);
    });

    it('handles ports without usb info', async () => {
      getPorts.mockResolvedValue([fakePort(undefined, undefined)]);
      expect(await service.getPort()).toBe(requested);
    });
  });
});
