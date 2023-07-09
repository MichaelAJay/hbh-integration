import {
  CollectionReference,
  DocumentReference,
} from '@google-cloud/firestore';
import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseClientService } from './database-client.service';
import { CollectionName } from './enum';

describe('DatabaseClientService', () => {
  let service: DatabaseClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DatabaseClientService],
    }).compile();

    service = module.get<DatabaseClientService>(DatabaseClientService);
  });

  describe('existence tests', () => {
    test('service should be defined', () => expect(service).toBeDefined());
    test('firestore instance should exist on service', () =>
      expect(service.firestore).toBeDefined());
  });
  describe('getDocRef', () => {
    it('passes argument directly to firestore.collection method', () => {
      const mockCollectionName = CollectionName.ACCOUNTS;
      const mockDocumentId = 'MOCK DOCUMENT ID';
      const mockDocumentReference: DocumentReference<any> =
        {} as DocumentReference<any>;

      const mockCollection = service.firestore.collection(
        CollectionName.ACCOUNTS,
      );
      jest
        .spyOn(service.firestore, 'collection')
        .mockReturnValue(mockCollection);
      jest.spyOn(mockCollection, 'doc').mockReturnValue(mockDocumentReference);
      service.getDocRef({
        collectionName: mockCollectionName,
        docId: mockDocumentId,
      });
      expect(service.firestore.collection).toHaveBeenCalledWith(
        CollectionName.ACCOUNTS,
      );
    });
    it('passes argument directly to firestore.collection instance doc method', () => {
      const mockCollectionName = CollectionName.ACCOUNTS;
      const mockDocumentId = 'MOCK DOCUMENT ID';
      const mockDocumentReference: DocumentReference<any> =
        {} as DocumentReference<any>;

      const mockCollection = service.firestore.collection(
        CollectionName.ACCOUNTS,
      );
      jest
        .spyOn(service.firestore, 'collection')
        .mockReturnValue(mockCollection);
      jest.spyOn(mockCollection, 'doc').mockReturnValue(mockDocumentReference);
      service.getDocRef({
        collectionName: mockCollectionName,
        docId: mockDocumentId,
      });
      expect(mockCollection.doc).toHaveBeenCalledWith(mockDocumentId);
    });
    it('returns a DocumentReference instance with correct id and parent id', async () => {
      const mockCollectionName = CollectionName.ACCOUNTS;
      const mockDocumentId = 'MOCK DOCUMENT ID';
      const docRef = service.getDocRef({
        collectionName: mockCollectionName,
        docId: mockDocumentId,
      });
      expect(docRef).toBeInstanceOf(DocumentReference);
      expect(docRef.id).toBe(mockDocumentId);
      expect(docRef.parent).toBeInstanceOf(CollectionReference);
      expect(docRef.parent.id).toBe(mockCollectionName);
    });
  });
  describe('set', () => {});
  describe('add', () => {});
  describe('update', () => {});
  describe('getOne', () => {});
  describe('getMany', () => {});
  describe('getManyIntersection', () => {});
  describe('delete', () => {});
});
