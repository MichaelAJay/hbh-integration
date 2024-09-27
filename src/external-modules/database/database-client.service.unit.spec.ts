import {
  CollectionReference,
  DocumentReference,
  Timestamp,
  WriteResult,
} from '@google-cloud/firestore';
import { firestore } from '@google-cloud/firestore/types/protos/firestore_v1_proto_api';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientError } from 'src/common/classes';
import { DatabaseClientService } from './database-client.service';
import { CollectionName, DbOrderStatus } from './enum';
it('passes', () => expect(true).toEqual(true));
// describe('DatabaseClientService', () => {
//   let service: DatabaseClientService;

// beforeEach(async () => {
//   const module: TestingModule = await Test.createTestingModule({
//     providers: [DatabaseClientService],
//   }).compile();

//   service = module.get<DatabaseClientService>(DatabaseClientService);
// });

// describe('existence tests', () => {
//   test('service should be defined', () => expect(service).toBeDefined());
//   test('firestore instance should exist on service', () =>
//     expect(service.firestore).toBeDefined());
// });
// describe('getDocRef', () => {
//   it('calls firestore.collection with the correct arguments', () => {});
//   it('calls firestore.collection.doc with the correct arguments', () => {});
//   it('returns DocumentReference on success', () => {});
// });
// describe('set', () => {});
// describe('add', () => {});
// describe('update', () => {});
// describe('getOne', () => {});
// describe('getMany', () => {});
// describe('getManyIntersection', () => {});
// describe('delete', () => {});

// afterEach(() => {
//   jest.restoreAllMocks();
//   service.firestore.terminate();
// });
// });
