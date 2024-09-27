// export type Overwrite<T, U> = { [P in Exclude<keyof T, keyof U>]: T[P] } & U; // Did not preserve optionality
type RequiredKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? never : K;
}[keyof T];

type OptionalKeys<T> = {
  [K in keyof T]-?: undefined extends T[K] ? K : never;
}[keyof T];

type Split<T> = { [K in RequiredKeys<T>]: T[K] } & Partial<{
  [K in OptionalKeys<T>]: T[K];
}>;

export type Overwrite<T, U> = U & Omit<Split<T>, keyof U>;
