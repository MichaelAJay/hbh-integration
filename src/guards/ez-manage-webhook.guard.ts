import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
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

      /**
       * @CHECKED
       */
      if (!req.headers) {
        const msg = 'Request is missing headers';
        this.logger.error(msg, {});
        throw new BadRequestException(msg);
      }

      /**
       * @CHECKED
       */
      const { timestamp, signature } = this.getTimestampAndSignatureFromHeaders(
        req.headers,
      );

      const body = req.body;
      /**
       * @CHECKED
       */
      if (!(body && typeof body === 'object' && Object.keys(body).length > 0)) {
        console.log('typeof body', typeof body);
        console.log('body keys', Object.keys(body));
        const msg = 'Payload is not object with keys';
        this.logger.error(msg, { payload: JSON.stringify(body) });
        throw new BadRequestException(msg);
      }

      /**
       * 0) Get webhook secret by account
       */
      const webhookSecret = await this.getWebhookSecret(body);

      let computed_signature_payload = '',
        computedSignature = '';
      /**
       * 1) Create a computed signature payload form the webhook request data
       */
      try {
        computed_signature_payload = `${timestamp}.${JSON.stringify(body)}`;
      } catch (err) {
        const msg = `Computed signature payload not created successfully`;
        this.logger.error(msg, { computed_signature_payload });
        throw new InternalServerErrorException(msg);
      }

      /**
       * 2) Compute an HMAC signature of the request data
       */
      try {
        computedSignature = createHmac('sha256', webhookSecret)
          .update(computed_signature_payload)
          .digest('hex');
      } catch (err) {
        const msg = `Internal computed signature failed`;
        this.logger.error(msg, { computedSignature });
        throw new InternalServerErrorException(msg);
      }

      /**
       * 3) Compare the provided signature with the computed one
       */
      if (signature !== computedSignature) {
        const msg = 'Incoming signature did not match computed signature';
        this.logger.error(msg, {
          signature,
          computedSignature,
          computed_signature_payload,
        });
        throw new BadRequestException(msg);
      }

      return true;
    } catch (err) {
      throw err;
    }
  }

  private getTimestampAndSignatureFromHeaders(headers: any): {
    timestamp: string;
    signature: string;
  } {
    const headerName = 'x-ezcater-signature';
    const ezCaterSignatureHeader = headers[headerName];
    /**
     * @CHECKED
     */
    if (!ezCaterSignatureHeader) {
      const msg = `Missing ${headerName} header`;
      this.logger.error(msg, {});
      throw new BadRequestException(msg);
    }

    /** Form should be <timestamp>.<signature> */
    /**
     * @CHECKED
     */
    const [timestamp, signature] = ezCaterSignatureHeader.split('.');
    const missingData: string[] = [];
    if (!timestamp) missingData.push('timestamp');
    if (!signature) missingData.push('signature');
    if (missingData.length > 0) {
      const msg = `Missing data: ${missingData}`;
      this.logger.error(msg, {
        'x-ezcater-signature': ezCaterSignatureHeader,
      });
      throw new BadRequestException(msg);
    }
    return { timestamp, signature };
  }

  private async getWebhookSecret(body: any): Promise<string> {
    const { parent_type, parent_id } = body;
    console.log('parent type', parent_type, 'parent_id', parent_id);

    const missingData: string[] = [];
    /**
     * @CHECKED
     */
    if (!parent_type) missingData.push('parent_type');
    /**
     * @CHECKED
     */
    if (!parent_id) missingData.push('parent_id');
    /**
     * @CHECKED
     */
    if (missingData.length > 0) {
      const msg = `The following fields are missing from the payload body: ${missingData}`;
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

    const webhookEnvVarPostfix = process.env.EZMANAGE_WEBHOOK_SECRET_POSTFIX;
    /**
     * @CHECKED
     */
    if (!webhookEnvVarPostfix) {
      const msg =
        'Missing EZMANAGE_WEBHOOK_SECRET_POSTFIX environment variable';
      this.logger.error(msg, {});
      throw new InternalServerErrorException(msg);
    }

    const webhookSecretName = `${webhookEnvVarPrefix}_${webhookEnvVarPostfix}`;
    const webhookSecret = process.env[webhookSecretName];
    if (!webhookSecret) {
      const msg = `Missing account specific environment variable with reference ${webhookEnvVarPrefix}`;
      this.logger.error(msg, {});
      throw new InternalServerErrorException(msg);
    }
    return webhookSecret;
  }
}
