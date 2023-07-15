import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { SentryError } from '@sentry/utils';
import { createHmac } from 'crypto';
import { EventNotificationPayloadParentType } from 'src/api/ezmanage-subscriber/enums';
import { AccountService } from 'src/internal-modules/account/account.service';
import * as Sentry from '@sentry/node';

@Injectable()
export class EzManageWebhookGuard implements CanActivate {
  constructor(private readonly accountService: AccountService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      if (process.env.ENV === 'local') return true;

      const req = context.switchToHttp().getRequest();

      /**
       * @CHECKED
       */
      if (!req.headers) {
        const err = new BadRequestException('Request is missing headers');
        Sentry.captureException(err);
        throw err;
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
        const err = new BadRequestException('Payload is not object with keys');
        Sentry.withScope((scope) => {
          scope.setExtra('payload', JSON.stringify(body));
          Sentry.captureException(err);
        });
        throw err;
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
        const error = new InternalServerErrorException(
          `Computed signature payload not created successfully`,
        );
        Sentry.withScope((scope) => {
          scope.setExtra(
            'computedSignaturePayload',
            computed_signature_payload,
          );
          Sentry.captureException(error);
        });
        throw error;
      }

      /**
       * 2) Compute an HMAC signature of the request data
       */
      try {
        computedSignature = createHmac('sha256', webhookSecret)
          .update(computed_signature_payload)
          .digest('hex');
      } catch (err) {
        const error = new InternalServerErrorException(
          `Internal computed signature failed`,
        );
        Sentry.captureException(error);
        throw error;
      }

      /**
       * 3) Compare the provided signature with the computed one
       */
      if (signature !== computedSignature) {
        const err = new BadRequestException(
          'Incoming signature did not match computed signature',
        );
        Sentry.withScope((scope) => {
          scope.setExtras({
            signature,
            computedSignature,
            computed_signature_payload,
          });
          Sentry.captureException(err);
        });
        throw err;
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
      const err = new BadRequestException(`Missing ${headerName} header`);
      Sentry.captureException(err);
      throw err;
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
      const err = new BadRequestException(`Missing data: ${missingData}`);
      Sentry.withScope((scope) => {
        scope.setExtra('x-ezcater-signature header', ezCaterSignatureHeader);
        Sentry.captureException(err);
      });
      throw err;
    }
    return { timestamp, signature };
  }

  private async getWebhookSecret(body: any): Promise<string> {
    const { parent_type, parent_id } = body;

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
      const err = new BadRequestException(
        `The following fields are missing from the payload body: ${missingData}`,
      );
      Sentry.captureException(err);
      throw err;
    }

    if (parent_type !== EventNotificationPayloadParentType.CATERER) {
      const err = new BadRequestException(
        `Incorrect parent_type.  Was expecting ${EventNotificationPayloadParentType.CATERER}, but received ${parent_type}`,
      );
      Sentry.captureException(err);
      throw err;
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
      const err = new InternalServerErrorException(
        'Missing EZMANAGE_WEBHOOK_SECRET_POSTFIX environment variable',
      );
      Sentry.captureException(err);
      throw err;
    }

    const webhookSecretName = `${webhookEnvVarPrefix}_${webhookEnvVarPostfix}`;
    const webhookSecret = process.env[webhookSecretName];
    if (!webhookSecret) {
      const err = new InternalServerErrorException(
        `Missing account specific environment variable with reference ${webhookEnvVarPrefix}`,
      );
      Sentry.captureException(err);
      throw err;
    }
    return webhookSecret;
  }
}
