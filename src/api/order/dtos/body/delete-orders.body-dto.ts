import { IsString } from 'class-validator';

export class DeleteOrdersBodyDto {
  @IsString({ each: true })
  ids: string[];
}
