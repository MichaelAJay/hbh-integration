export interface ICreateLeadResponse {
  result: ICreateLeadResult;
}

export interface ICreateLeadResult {
  id: number;
  description: string;
}

export function validateCreateLeadResponse(
  resp: any,
): resp is ICreateLeadResponse {
  return (
    typeof resp === 'object' &&
    resp.result &&
    typeof resp.result === 'object' &&
    typeof resp.result.id === 'number' &&
    typeof resp.result.description === 'string'
  );
}
