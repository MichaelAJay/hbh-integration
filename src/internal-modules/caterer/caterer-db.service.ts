import { Injectable } from '@nestjs/common';
import { DatabaseClientService } from 'src/external-modules/database/database-client.service';

@Injectable()
export class CatererDbService {
  constructor(private readonly dbClientService: DatabaseClientService) {}
}
