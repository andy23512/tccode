// Reference: https://github.com/CharaChorder/DeviceManager/blob/45682f0d1adddb0d689285e284d309123028f22d/src/lib/serialization/actions.ts

/**
 * Compresses an action list into a Uint8Array of variable-length 8/13-bit integers.
 *
 * Action codes <32 are invalid.
 */
export function compressActions(actions: number[]): Uint8Array {
  const buffer = new Uint8Array(actions.length * 2);
  let i = 0;
  for (const action of actions) {
    if (action > 0xff) {
      buffer[i++] = action >>> 8;
    }
    buffer[i++] = action & 0xff;
  }
  return buffer.slice(0, i);
}

/**
 * Decompresses actions
 *
 * @see {compressActions}
 */
export function decompressActions(raw: Uint8Array): number[] {
  const actions: number[] = [];
  for (let i = 0; i < raw.length; i++) {
    // The `?? 0` fallbacks are unreachable: both indexes are bounds-checked above.
    let action = raw[i] ?? 0;
    if (action > 0 && action < 32 && i + 1 < raw.length) {
      action = (action << 8) | (raw[++i] ?? 0);
    }
    actions.push(action);
  }
  return actions;
}
