import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth/auth.service';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: AuthService,
          useValue: {
            createSalt: jest.fn(),
            generateRandomPassword: jest.fn(),
            hashValue: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    authService = module.get<AuthService>(AuthService);
  });

  describe('existence tests', () => {
    test('service is defined', () => expect(service).toBeDefined());
    test('auth service is defined', () => expect(authService).toBeDefined());
  });
  describe('generateSaltAndHashedPassword', () => {
    it('calls authService.createSalt with the correct arguments', async () => {
      const mockSalt = 'MOCK SALT';
      jest.spyOn(authService, 'createSalt').mockReturnValue(mockSalt);
      await service.generateSaltAndHashedPassword('any string');
      expect(authService.createSalt).toHaveBeenCalledWith();
    });
    it('propagates any error thrown by authService.createSalt', async () => {
      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(authService, 'createSalt').mockImplementation(() => {
        throw mockError;
      });
      await expect(service.generateSaltAndHashedPassword()).rejects.toThrow(
        mockError,
      );
    });
    describe('password is not included as input argument', () => {
      it('calls authService.generateRandomPassword with the correct arguments', async () => {
        const mockSalt = 'MOCK SALT';
        const mockGeneratedPassword = 'MOCK GENERATED PASSWORD';
        jest.spyOn(authService, 'createSalt').mockReturnValue(mockSalt);
        jest
          .spyOn(authService, 'generateRandomPassword')
          .mockReturnValue(mockGeneratedPassword);
        await service.generateSaltAndHashedPassword();
        expect(authService.generateRandomPassword).toHaveBeenCalledWith();
      });
      it('propagates any error thrown by authService.generateRandomPassword', async () => {
        const mockSalt = 'MOCK SALT';
        jest.spyOn(authService, 'createSalt').mockReturnValue(mockSalt);
        const mockError = new Error('ERROR UNDER TEST');
        jest
          .spyOn(authService, 'generateRandomPassword')
          .mockImplementation(() => {
            throw mockError;
          });
        await expect(service.generateSaltAndHashedPassword()).rejects.toThrow(
          mockError,
        );
      });
      it('calls authService.hashValue with the correct arguments', async () => {
        const mockSalt = 'MOCK SALT';
        const mockRandomPassword = 'MOCK NON-RANDOM RANDOM PASSWORD';
        jest.spyOn(authService, 'createSalt').mockReturnValue(mockSalt);
        jest
          .spyOn(authService, 'generateRandomPassword')
          .mockReturnValue(mockRandomPassword);
        await service.generateSaltAndHashedPassword();
        expect(authService.hashValue).toHaveBeenCalledWith({
          value: mockRandomPassword,
          salt: mockSalt,
        });
      });
    });
    describe('password is included as input STRING argument', () => {
      it('does not call authService.generateRandomPassword', async () => {
        const mockSalt = 'MOCK SALT';
        jest.spyOn(authService, 'createSalt').mockReturnValue(mockSalt);

        await service.generateSaltAndHashedPassword('input pw');
        expect(authService.generateRandomPassword).not.toHaveBeenCalled();
      });
      it('calls authService.hashValue with the correct arguments', async () => {
        const inputPassword = 'inputPassword';
        const mockSalt = 'MOCK SALT';
        jest.spyOn(authService, 'createSalt').mockReturnValue(mockSalt);

        await service.generateSaltAndHashedPassword(inputPassword);
        expect(authService.hashValue).toHaveBeenCalledWith({
          value: inputPassword,
          salt: mockSalt,
        });
      });
    });
    it('propagates any error thrown by authService.hashValue', async () => {
      const inputPassword = 'inputPassword';
      const mockSalt = 'MOCK SALT';
      jest.spyOn(authService, 'createSalt').mockReturnValue(mockSalt);

      const mockError = new Error('ERROR UNDER TEST');
      jest.spyOn(authService, 'hashValue').mockRejectedValue(mockError);

      await expect(
        service.generateSaltAndHashedPassword(inputPassword),
      ).rejects.toThrow(mockError);
    });
    it('returns object with password, hashedPassword, and salt properties', async () => {
      const inputPassword = 'inputPassword';
      const mockSalt = 'MOCK SALT';
      jest.spyOn(authService, 'createSalt').mockReturnValue(mockSalt);

      const hashedPassword = 'MOCK HASHED PASSWORD';
      jest.spyOn(authService, 'hashValue').mockResolvedValue(hashedPassword);

      const result = await service.generateSaltAndHashedPassword(inputPassword);
      expect(result).toEqual({
        password: inputPassword,
        hashedPassword,
        salt: mockSalt,
      });
    });
  });

  afterEach(() => jest.resetAllMocks());
});
