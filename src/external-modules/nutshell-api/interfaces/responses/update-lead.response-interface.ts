export interface IUpdateLeadResponse {
  result: {
    rev: string;
    description: string;
  };
}

export function ValidateUpdateLeadResponse(
  response: any,
): response is IUpdateLeadResponse {
  return (
    typeof response === 'object' &&
    response.result &&
    typeof response.result === 'object' &&
    typeof response.result.rev === 'string' &&
    typeof response.result.description === 'string'
  );
}
