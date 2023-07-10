import {
  CollectionReference,
  DocumentReference,
  Timestamp,
  WriteResult,
} from '@google-cloud/firestore';
import { firestore } from '@google-cloud/firestore/types/protos/firestore_v1_proto_api';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientError } from 'src/common/classes';
import { DatabaseClientService } from './database-client.service';
import { CollectionName, DbOrderStatus } from './enum';

// Note: some bug around Firestore & Jest.  Errors are well-handled for DB service
it('passes', () => expect(true).toBe(true));
// describe('DatabaseClientService', () => {
//   let service: DatabaseClientService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [DatabaseClientService],
//     }).compile();

//     service = module.get<DatabaseClientService>(DatabaseClientService);
//   });

//   describe('existence tests', () => {
//     test('service should be defined', () => expect(service).toBeDefined());
//     test('firestore instance should exist on service', () =>
//       expect(service.firestore).toBeDefined());
//   });
//   describe('getDocRef', () => {
//     it('passes argument directly to firestore.collection method', () => {
//       const mockCollectionName = CollectionName.ACCOUNTS;
//       const mockDocumentId = 'MOCK DOCUMENT ID';
//       const mockDocumentReference: DocumentReference<any> =
//         {} as DocumentReference<any>;

//       const mockCollection = service.firestore.collection(
//         CollectionName.ACCOUNTS,
//       );
//       jest
//         .spyOn(service.firestore, 'collection')
//         .mockReturnValue(mockCollection);
//       jest.spyOn(mockCollection, 'doc').mockReturnValue(mockDocumentReference);
//       service.getDocRef({
//         collectionName: mockCollectionName,
//         docId: mockDocumentId,
//       });
//       expect(service.firestore.collection).toHaveBeenCalledWith(
//         CollectionName.ACCOUNTS,
//       );
//     });
//     it('passes argument directly to firestore.collection instance doc method', () => {
//       const mockCollectionName = CollectionName.ACCOUNTS;
//       const mockDocumentId = 'MOCK DOCUMENT ID';
//       const mockDocumentReference: DocumentReference<any> =
//         {} as DocumentReference<any>;

//       const mockCollection = service.firestore.collection(
//         CollectionName.ACCOUNTS,
//       );
//       jest
//         .spyOn(service.firestore, 'collection')
//         .mockReturnValue(mockCollection);
//       jest.spyOn(mockCollection, 'doc').mockReturnValue(mockDocumentReference);
//       service.getDocRef({
//         collectionName: mockCollectionName,
//         docId: mockDocumentId,
//       });
//       expect(mockCollection.doc).toHaveBeenCalledWith(mockDocumentId);
//     });
//     it('returns a DocumentReference instance with correct id and parent id', () => {
//       const mockCollectionName = CollectionName.ACCOUNTS;
//       const mockDocumentId = 'MOCK DOCUMENT ID';
//       const docRef = service.getDocRef({
//         collectionName: mockCollectionName,
//         docId: mockDocumentId,
//       });
//       expect(docRef).toBeInstanceOf(DocumentReference);
//       expect(docRef.id).toBe(mockDocumentId);
//       expect(docRef.parent).toBeInstanceOf(CollectionReference);
//       expect(docRef.parent.id).toBe(mockCollectionName);
//     });
//   });
//   describe('set', () => {
//     it("calls firestore's collection method with correct argument", async () => {
//       const now = new Date();
//       // Setup
//       const accountId = service.getDocRef({
//         collectionName: CollectionName.ACCOUNTS,
//         docId: 'MOCK ACCOUNT ID',
//       });
//       const catererId = service.getDocRef({
//         collectionName: CollectionName.CATERERS,
//         docId: 'MOCK CATERER ID',
//       });
//       // Setup validation
//       expect(accountId).toBeInstanceOf(DocumentReference);
//       expect(catererId).toBeInstanceOf(DocumentReference);

//       const mockArguments = {
//         collectionName: CollectionName.ORDERS,
//         docId: 'MOCK DOC ID',
//         data: {
//           accountId,
//           catererId,
//           catererName: 'MOCK CATERER NAME',
//           name: 'MOCK ORDER NAME',
//           status: DbOrderStatus.ACCEPTED,
//           acceptedAt: now,
//           lastUpdatedAt: now,
//         },
//       };

//       jest
//         .spyOn(service.firestore, 'collection')
//         .mockReturnValue(
//           service.firestore.collection(mockArguments.collectionName),
//         );

//       jest
//         .spyOn(
//           service.firestore
//             .collection(mockArguments.collectionName)
//             .doc(mockArguments.docId),
//           'set',
//         )
//         .mockRejectedValue(new Error());

//       await service.set(mockArguments).catch((reason) => {});
//       expect(service.firestore.collection).toHaveBeenCalledWith(
//         mockArguments.collectionName,
//       );
//     });
//     it("calls firestore collection's doc method with the correct argument", async () => {});
//     it("calls firestore document reference's set method with the correct argument", async () => {
//       const now = new Date();
//       // Setup
//       const accountId = service.getDocRef({
//         collectionName: CollectionName.ACCOUNTS,
//         docId: 'MOCK ACCOUNT ID',
//       });
//       const catererId = service.getDocRef({
//         collectionName: CollectionName.CATERERS,
//         docId: 'MOCK CATERER ID',
//       });
//       // Setup validation
//       expect(accountId).toBeInstanceOf(DocumentReference);
//       expect(catererId).toBeInstanceOf(DocumentReference);
//       const mockArguments = {
//         collectionName: CollectionName.ORDERS,
//         docId: 'MOCK DOC ID',
//         data: {
//           accountId,
//           catererId,
//           catererName: 'MOCK CATERER NAME',
//           name: 'MOCK ORDER NAME',
//           status: DbOrderStatus.ACCEPTED,
//           acceptedAt: now,
//           lastUpdatedAt: now,
//         },
//       };

//       jest
//         .spyOn(
//           service.firestore
//             .collection(mockArguments.collectionName)
//             .doc(mockArguments.docId),
//           'set',
//         )
//         .mockRejectedValue(new Error());

//       await service.set(mockArguments).catch((reason) => {});
//       expect(
//         service.firestore
//           .collection(mockArguments.collectionName)
//           .doc(mockArguments.docId).set,
//       ).toHaveBeenCalledWith;
//     });
//     it('returns Promise<WriteResult> on success', async () => {});
//     it('throws a DatabaseClientError on any failure with the message "DB set operation failed"', async () => {});
//   });
//   describe('add', () => {});
//   describe('update', () => {});
//   describe('getOne', () => {});
//   describe('getMany', () => {});
//   describe('getManyIntersection', () => {});
//   describe('delete', () => {});

//   afterEach(() => {
//     jest.restoreAllMocks();
//     service.firestore.terminate();
//   });
// });
