describe('Auth Service unit tests - NOT IMPLEMENTED', () => {
  it('IS NOT IMPLEMENTED', () => {});
});
// import { JwtService } from '@nestjs/jwt';
// import { Test, TestingModule } from '@nestjs/testing';
// import { AuthService } from './auth.service';
// import * as crypto from 'crypto';

// describe('AuthService', () => {
//   let service: AuthService;
//   let jwtService: JwtService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         AuthService,
//         {
//           provide: JwtService,
//           useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() },
//         },
//       ],
//     }).compile();

//     service = module.get<AuthService>(AuthService);
//     jwtService = module.get<JwtService>(JwtService);
//   });

//   describe('existence tests', () => {
//     test('service is defined', () => expect(service).toBeDefined());
//     test('jwtService is defined', () => expect(jwtService).toBeDefined());
//   });
//   /**
//    * These tests do something simple, but to adequately test them, a large refactor needs to take place across the application
//    * That refactor is that private service methods should be abstracted into private service classes with public methods
//    * Then the service class dependencies can be mocked, as well as their public methods
//    */
//   // describe('createSalt', () => {
//   //   it('calls service generateRandomBytes with input 16', () => {});
//   //   it('propagates any error thrown by service generateRandomBytes', () => {});
//   //   it('returns the result of service genereateRandomBytes on success', () => {});
//   // });
//   // describe('generateRandomPassword', () => {
//   //   /**
//   //    * USE ABOVE
//   //    */
//   // });
//   describe('hashValue', () => {
//     it('calls crypto.pbkdf2 with the correct arguments', async () => {
//       const mockArguments = {
//         value: 'MOCK VALUE TO HASH',
//         salt: 'MOCK SALT',
//       };
//       jest
//         .spyOn(crypto, 'pbkdf2')
//         .mockImplementation(
//           (value, salt, iterations, keylen, digest, callback) => {
//             callback(null, Buffer.from('mockDerivedKey'));
//           },
//         );
//       await service.hashValue(mockArguments);
//       expect(crypto.pbkdf2).toHaveBeenCalledWith(
//         mockArguments.value,
//         mockArguments.salt,
//         10000,
//         64,
//         'sha512',
//       );
//     });
//     it('propagates any error thrown by pbkdf2', async () => {});
//     it('returns the result of pbkdf2 as a hex string on success', async () => {});
//   });
//   describe('hashedValueGate', () => {
//     it('calls service hashValue with the correct arguments', async () => {});
//     it('propagates any error thrown by service hashValue', async () => {});
//     it('throws ForbiddenException if hash comparison fails', async () => {});
//     it('returns void on success', async () => {});
//   });
//   describe('signAuthToken', () => {
//     it('calls service signToken with the correct arguments', async () => {});
//     it('propagates any error thrown by service signToken', async () => {});
//     it('returns the result of service signToken on success', async () => {});
//   });
//   describe('signRefreshToken', () => {
//     /**
//      * SEE ABOVE
//      */
//   });
//   describe('signClaimAcctToken', () => {
//     /**
//      * SEE ABOVE
//      */
//   });
//   describe('signToken', () => {
//     it('throws InternalServerErrorException if "secret" argument is undefined', async () => {});
//     it('calls jwtService.signAsync with the correct arguments', async () => {});
//     it('propagates any error thrown by jwtService.signAsync', async () => {});
//     it('returns the result of jwtService.signAsync on success', async () => {});
//   });
//   describe('verifyAuthToken', () => {
//     it('calls service verifyToken with the correct arguments', async () => {});
//     it('propagates any error thrown by service verifyToken', async () => {});
//     it('throws UnprocessableError if verifyToken result "accountId" is not a string', async () => {});
//     it('throws UnprocessableError if verifyToken result "userId" is not a string', async () => {});
//     it('returns object with accountId, userId, and ref on success', async () => {});
//   });
//   describe('verifyRefreshToken', () => {
//     it('calls service verifyToken with the correct arguments', async () => {});
//     it('propagates any error thrown by service verifyToken', async () => {});
//     it('throws UnprocessableError if verifyToken result "userId" is not a string', async () => {});
//     it('returns object with userId on success', async () => {});
//   });
//   describe('verifyAcctToken', () => {
//     it('calls service verifyToken with the correct arguments', async () => {});
//     it('propagates any error thrown by service verifyToken', async () => {});
//     it('throws UnprocessableError if verifyToken result "userId" is not a string', async () => {});
//     it('throws UnprocessableError if verifyToken result "password" is not a string', async () => {});
//     it('returns object with userId and password on success', async () => {});
//   });
//   describe('verifyToken', () => {
//     it('throws InternalServerErrorException if "secret" argument is undefined', async () => {});
//     it('calls jwt.verifyAsync with the correct arguments', async () => {});
//     it('propagates any error thrown by jwtService.verifyAsync', async () => {});
//     it('throws ForbiddenException with "MISSING_EXP" message if jwtService.verifyAsync resolved value does not include token expiry "exp"', async () => {});
//     it('throws ForbiddenException with "EXPIRED" message if "exp" is in the past', async () => {});
//     it('returns the resolved value from jwtService.verifyAsync on success', async () => {});
//   });

//   afterEach(() => {
//     jest.restoreAllMocks();
//   });
// });
