export function isInputDocumentReference(input: any): boolean {
  return (
    input &&
    typeof input === 'object' &&
    'id' in input &&
    typeof input.id === 'string'
  );
}
