import * as Sentry from '@sentry/node';

type OrderSourceType = 'MARKETPLACE' | 'EZ_ORDERING';

/** See findStagesets */
export const EzManageSourceTypeToCrmValues: Record<
  OrderSourceType,
  { pipelineId: string; crmName: string; pipelineName: string }
> = {
  MARKETPLACE: {
    pipelineId: '23',
    crmName: 'EZ_CATER',
    pipelineName: 'EZCater',
  },
  EZ_ORDERING: {
    pipelineId: '1',
    crmName: 'EZ_ORDER',
    pipelineName: 'Catering',
  },
  /**
   * Missing pipelines
   * Gifting, Paper GC Billing, Fundraising, Donations
   */
};

export const SourceTypeValues = Object.keys(EzManageSourceTypeToCrmValues);

export function retrieveCrmNameFromOrderSourceType(
  orderSourceType: string,
): string {
  const values = EzManageSourceTypeToCrmValues[`${orderSourceType}`];
  if (values && values.crmName) return values.crmName;
  return orderSourceType;
}

export function retrievePipelineIdFromOrderSourceType(
  orderSourceType: string,
): string | undefined {
  if (!SourceTypeValues.includes(orderSourceType)) {
    Sentry.captureMessage(
      `Missing from source type mapper: ${orderSourceType}`,
    );
    return undefined;
  }
  const values = EzManageSourceTypeToCrmValues[`${orderSourceType}`];
  if (values && values.pipelineId) return values.pipelineId;
  return undefined;
}
