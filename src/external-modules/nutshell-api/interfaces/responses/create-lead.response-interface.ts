export interface ICreateLeadResponse {
  result: {
    id: number;
  };
}

export function validateCreateLeadResponse(
  resp: any,
): resp is ICreateLeadResponse {
  return (
    typeof resp === 'object' &&
    resp.result &&
    typeof resp.result === 'object' &&
    typeof resp.result.id === 'number'
  );
}
