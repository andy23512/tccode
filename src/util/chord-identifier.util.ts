export function convertChordInputKeysToIdentifier(
  chordInputKeys: string[],
): string {
  return [...chordInputKeys].sort((a, b) => a.localeCompare(b)).join('\t');
}
