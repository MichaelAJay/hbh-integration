import { UnprocessableEntityException } from '@nestjs/common';
import { UiOrderStatus } from 'src/api/order/enums/output';
import { CustomErrorObject } from 'src/common/types';
import { DbOrderStatus } from 'src/external-modules/database/enum';

export function ConvertOrderStatusDbToUi({
  status,
  dueTime,
}: {
  status: DbOrderStatus;
  dueTime: string;
}): UiOrderStatus {
  switch (status) {
    case DbOrderStatus.CANCELLED:
    case DbOrderStatus.cancelled:
      return UiOrderStatus.CANCELLED;
    case DbOrderStatus.ARCHIVED:
    case DbOrderStatus.archived:
      return UiOrderStatus.ARCHIVED;
    case DbOrderStatus.ACCEPTED:
    case DbOrderStatus.accepted:
      /**
       * May be ACCEPTED or PENDING
       */
      /**
       * Convert dueTime to a Date and compare to new Date
       */
      const dueDate = new Date(dueTime);
      if (isNaN(dueDate.getTime())) {
        const err: CustomErrorObject = {
          message: `EzManage timestamp could not create a Date. Timestamp: ${dueTime}`,
          isLogged: false,
        };
        throw new UnprocessableEntityException(err);
      }

      return dueDate < new Date()
        ? UiOrderStatus.PENDING
        : UiOrderStatus.ACCEPTED;

    default:
      const err: CustomErrorObject = {
        message: `Unhandled db order status ${status}`,
        isLogged: false,
      };

      throw new UnprocessableEntityException(err);
  }
}

export function ConvertOrderStatusUiToDb({
  status,
}: {
  status: UiOrderStatus;
}): DbOrderStatus {
  switch (status) {
    case UiOrderStatus.ACCEPTED:
    case UiOrderStatus.PENDING:
      return DbOrderStatus.ACCEPTED;
    case UiOrderStatus.CANCELLED:
      return DbOrderStatus.CANCELLED;
    case UiOrderStatus.ARCHIVED:
      return DbOrderStatus.ARCHIVED;
    default:
      const err: CustomErrorObject = {
        message: `Unhandled ui order status ${status}`,
        isLogged: false,
      };

      throw new UnprocessableEntityException(err);
  }
}
