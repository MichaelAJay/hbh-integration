import { ICreateLeadReturn } from 'src/external-modules/nutshell-api/interfaces/returns';

/**
 * This will need to become more flexible
 */
export type GeneratePrimaryNutshellEntityReturn = Omit<
  ICreateLeadReturn,
  'id' | 'products'
> & {
  crmId: string;
  isSubtotalMatch?: boolean;
};
