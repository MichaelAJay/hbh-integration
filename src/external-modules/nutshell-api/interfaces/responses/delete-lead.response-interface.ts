export interface IDeleteLeadResponse {
  result: boolean;
}

export function ValidateDeleteLeadResponse(
  response: any,
): response is IDeleteLeadResponse {
  return (
    typeof response === 'object' &&
    response.result &&
    typeof response.result === 'boolean'
  );
}
