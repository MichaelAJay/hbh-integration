export type BaseJwtPayload = {
  exp: number;
  userId: string;
};

export type AccessJWTPayload = BaseJwtPayload & {
  accountId: string;
};

export type RefreshJWTPayload = BaseJwtPayload;
