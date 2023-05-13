import { IUserModel } from 'src/external-modules/database/models';

export type UpdateUser = Partial<Omit<IUserModel, 'accountId' | 'salt'>>;
