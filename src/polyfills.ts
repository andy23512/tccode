if (navigator.serial === undefined && navigator.usb !== undefined) {
  // @ts-expect-error polyfill
  navigator.serial = await import('web-serial-polyfill').then(
    ({ serial }) => serial
  );
}
