export function FormatOrderName(orderName: string): string {
  return `${orderName.slice(0, 3)}-${orderName.slice(3)}`;
}
