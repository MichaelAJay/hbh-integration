export type CustomErrorObject = {
  message: string;
  isLogged: boolean;
};

export function checkErrorAsCustomErrorObject(
  err: any,
): err is CustomErrorObject {
  return typeof err.message === 'string' && typeof err.isLogged === 'boolean';
}
