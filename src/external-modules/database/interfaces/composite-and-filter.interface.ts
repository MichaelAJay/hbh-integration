import { FieldPath, WhereFilterOp } from '@google-cloud/firestore';

export interface ICompositeAndFilter {
  operator: 'AND';
  filters: {
    fieldPath: string | FieldPath;
    opStr: WhereFilterOp;
    value: unknown;
  }[];
}
