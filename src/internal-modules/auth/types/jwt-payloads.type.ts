export type BaseJwtPayload = {
  exp: number;
  userId: string;
};

export type AccessJWTPayload = BaseJwtPayload & {
  accountId: string;
  ref: string;
};

export type RefreshJWTPayload = BaseJwtPayload;

export type AccountJwtPayload = BaseJwtPayload & {
  password: string;
};
