export interface IGetLeadResponse {
  result: { rev: string; description: string };
}

export function validateGetLeadResponse(
  response: any,
): response is IGetLeadResponse {
  return (
    typeof response === 'object' &&
    response.result &&
    typeof response.result === 'object' &&
    typeof response.result.rev === 'string' &&
    typeof response.result.description === 'string'
  );
}
