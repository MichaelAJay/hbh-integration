import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { createHmac } from 'crypto';
import { EventNotificationPayloadParentType } from 'src/api/ezmanage-subscriber/enums';
import { AccountService } from 'src/internal-modules/account/account.service';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';

@Injectable()
export class EzManageWebhookGuard implements CanActivate {
  constructor(
    private readonly accountService: AccountService,
    private readonly logger: CustomLoggerService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const req = context.switchToHttp().getRequest();

      const headerName = 'X-Ezcater-Signature';
      const ezCaterSignatureHeader = req.headers[headerName];
      if (!ezCaterSignatureHeader) {
        const msg = `Missing ${headerName}`;
        this.logger.error(msg, {});
        throw new BadRequestException(msg);
      }

      if (typeof ezCaterSignatureHeader !== 'string') {
        const msg = `${headerName} header value should be string, but is ${typeof ezCaterSignatureHeader}`;
        this.logger.error(msg, {});
        throw new BadRequestException(msg);
      }
      /** Form should be <timestamp>.<signature> */
      const [timestamp, signature] = ezCaterSignatureHeader.split('.');
      const missingData: string[] = [];
      if (!timestamp) missingData.push('timestamp');
      if (!signature) missingData.push('signature');
      if (missingData.length > 0) {
        const msg = `Missing data: ${missingData}`;
        this.logger.error(msg, {});
        throw new BadRequestException(msg);
      }

      const body = req.body;
      if (!body) {
        const msg = 'Request has no payload';
        this.logger.error(msg, {});
        throw new BadRequestException(msg);
      }

      if (typeof body !== 'object') {
        const msg = 'Payload is not object';
        this.logger.error(msg, {});
        throw new BadRequestException(msg);
      }

      /**
       * 0) Get webhook secret by account
       */
      const webhookSecret = await this.getWebhookSecret(body);

      /**
       * 1) Create a computed signature payload form the webhook request data
       */
      const computed_signature_payload = `${timestamp}.${JSON.stringify(body)}`;

      /**
       * 2) Compute an HMAC signature of the request data
       */
      const computedSignature = createHmac('sha256', webhookSecret)
        .update(computed_signature_payload)
        .digest('hex');

      /**
       * 3) Compare the provided signature with the computed one
       */
      if (signature !== computedSignature) {
        const msg = 'Incoming signature did not match computed signature';
        this.logger.error(msg, {});
        throw new BadRequestException(msg);
      }

      return true;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getWebhookSecret(body: any): Promise<string> {
    const { parent_type, parent_id } = body;

    const missingData: string[] = [];
    if (!parent_type) missingData.push('parent_type');
    if (!parent_id) missingData.push('parent_id');
    if (missingData.length > 0) {
      const msg = `The following fields are missing from the payload body: ${missingData}`;
      this.logger.error(msg, {});
    }

    const badData: string[] = [];
    if (typeof parent_type !== 'string') badData.push('parent_type');
    if (typeof parent_id !== 'string') badData.push('parent_id');
    if (badData.length > 0) {
      const msg = `The following fields are expected to be strings and aren't: ${badData}`;
      this.logger.error(msg, {});
      throw new BadRequestException(msg);
    }

    if (parent_type !== EventNotificationPayloadParentType.CATERER) {
      const msg = `Incorrect parent_type.  Was expecting ${EventNotificationPayloadParentType.CATERER}, but received ${parent_type}`;
      this.logger.error(msg, {});
      throw new BadRequestException(msg);
    }

    const webhookEnvVarPrefix =
      await this.accountService.getEnvironmentVariablePrefixByCatererId(
        parent_id,
      );

    return webhookEnvVarPrefix;
  }
}
