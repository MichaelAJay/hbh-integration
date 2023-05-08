import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'src/support-modules/database/database-client.service';

@Injectable()
export class UserDbService {
  constructor(private readonly dbClientService: DatabaseClientService) {}
}
