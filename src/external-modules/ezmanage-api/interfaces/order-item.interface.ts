import { UUID } from 'src/common/types';
import { EzManageId } from '../types';
import { IEzManageMoney } from './money.interface';

interface IOrderItemCustomization {
  customizationId: EzManageId;
  customizationTypeId: EzManageId;
  customizationTypeName: string;
  name: string;
  posCustomizationId: string | null;
  quantity: number | null;
}

export interface IEzManageOrderItem {
  customizations: IOrderItemCustomization[];
  labelFor: string | null;
  menuItemSizeId: UUID | null;
  name: string | null;
  noteToCaterer: string | null;
  posItemId: string | null;
  quantity: number;
  specialInstructions: string | null;
  totalInSubunits: IEzManageMoney | null;
  uuid: UUID;
}
