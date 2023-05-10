export type Overwrite<T, U> = { [P in Exclude<keyof T, keyof U>]: T[P] } & U;
