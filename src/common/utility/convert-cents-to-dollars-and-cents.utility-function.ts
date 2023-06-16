export function ConvertCentsToDollarsAndCents(cents: number) {
  return Number((cents / 100).toFixed(2));
}
