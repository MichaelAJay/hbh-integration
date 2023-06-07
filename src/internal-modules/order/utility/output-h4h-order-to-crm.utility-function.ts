import { IGetOrderOutput } from 'src/api/order/interfaces/output';

/**
 * 6 June 2023
 * Outputs to a Nutshell Lead
 */
export function outputH4HOrderToCrm(
  order: Omit<IGetOrderOutput, 'catererName'>,
) {}
