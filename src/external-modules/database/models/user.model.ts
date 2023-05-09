export interface IUserModel {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  hashedPassword: string;
  salt: string;
}
