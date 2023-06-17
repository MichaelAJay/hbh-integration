import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  UnprocessableEntityException,
} from '@nestjs/common';
import * as jayson from 'jayson/promise';
import { Cache } from 'cache-manager';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { IAddTaskToEntity, ICreateLead } from './interfaces/requests';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import * as Sentry from '@sentry/node';
import { CrmError } from 'src/common/classes';
import {
  validateCreateLeadResponse,
  validateGetLeadResponse,
  ValidateUpdateLeadResponse,
} from './interfaces/responses';
import { IAbbreviatedLead } from './interfaces';

const TEN_MINUTES_IN_MS = 10 * 60 * 1000;

@Injectable()
export class NutshellApiService {
  private cacheTTL_in_MS: number;
  constructor(
    private readonly logger: CustomLoggerService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    /**
     * As of cache-manager@5, TTL is set in milliseconds
     */
    this.cacheTTL_in_MS = 20 * 60 * 1000;
  }

  /**
   * Configuration & setup
   */

  async getApiForUsername({
    userName,
    apiKey,
  }: {
    userName: string;
    apiKey: string;
  }) {
    const userCachedDomain = await this.cacheManager.get(userName);
    if (typeof userCachedDomain === 'string') return userCachedDomain;

    const client = jayson.Client.https({
      host: 'api.nutshell.com',
      path: '/v1/json',
      headers: { Authorization: this.getBasicAuthValue({ userName, apiKey }) },
    });
    const response = await client
      .request('getApiForUsername', {
        username: userName,
      })
      .catch((reason) => {
        console.error('Request failed', reason);
        throw reason;
      });
    const selectedDomain = this.selectDomain(response);
    await this.cacheManager
      .set(userName, selectedDomain, this.cacheTTL_in_MS)
      .catch((reason) => {
        console.error('Cache manager set failed', reason);
        throw reason;
      });
    return selectedDomain;
  }

  private selectDomain(response: any) {
    try {
      // /**
      //  * Selection criteria: (subject to change)
      //  */
      if (this.isGetApiForUsernameResponseValid(response)) {
        return (response as { result: { api: string } }).result.api;
      } else {
        const msg = 'Api domain not successfully found';
        this.logger.error(msg, {});
        throw new UnprocessableEntityException(msg);
      }
    } catch (err) {
      console.error('Select domain failed', err);
      err;
    }
  }

  private isGetApiForUsernameResponseValid(response: any) {
    /**
     * This could have logs that tell a better story
     */
    const responseType = typeof response;
    if (responseType !== 'object') {
      const msg = 'Response is not object as expected';
      this.logger.error(msg, { responseType });
      throw new UnprocessableEntityException(msg);
    }

    const { result } = response;
    const resultType = typeof result;
    if (resultType !== 'object') {
      const msg = 'Response.result is not object as expected';
      this.logger.error(msg, { responseType, resultType });
      throw new UnprocessableEntityException(msg);
    }

    const { api } = result;
    const apiType = typeof api;
    if (apiType !== 'string') {
      const msg = 'Response.result.api is not string as expected';
      this.logger.error(msg, { responseType, resultType, apiType });
      throw new UnprocessableEntityException(msg);
    }

    return true;
  }

  private getBasicAuthValue({
    userName,
    apiKey,
  }: {
    userName: string;
    apiKey: string;
  }) {
    /**
     * Return Base64-encoded string <username>:<apikey>
     */
    return `Basic ${Buffer.from(`${userName}:${apiKey}`).toString('base64')}`;
  }

  private getUserNameAndApiKeyForAcct(ref: ACCOUNT_REF) {
    const {
      NUTSHELL_USERNAME_POSTFIX: userNamePostfix,
      NUTSHELL_API_KEY_POSTFIX: apiKeyPostfix,
    } = process.env;

    if (!(userNamePostfix && apiKeyPostfix)) {
      const msg = 'Missing necessary system configuration variables';
      this.logger.error(msg, { userNamePostfix, apiKeyPostfix });
      throw new InternalServerErrorException(msg);
    }

    const userNameEnvVarName = `${ref}_${userNamePostfix}`;
    const apiKeyEnvVarName = `${ref}_${apiKeyPostfix}`;
    const userName = process.env[userNameEnvVarName];
    const apiKey = process.env[apiKeyEnvVarName];

    if (!(userName && apiKey)) {
      const msg = 'Missing neccessary client configuration variables';
      this.logger.error(msg, {
        ref: ref,
        userNameEnvVarName,
        apiKeyEnvVarName,
        userName,
        apiKey,
      });
      throw new InternalServerErrorException(msg);
    }
    return { userName, apiKey };
  }

  /**
   * This may be the wrong name, or maybe I don't want to do it this way.  Seems pretty good though.
   */
  private async generateClient(ref: ACCOUNT_REF) {
    const { userName, apiKey } = this.getUserNameAndApiKeyForAcct(ref);

    const domain = await this.getApiForUsername({ userName, apiKey });

    return jayson.Client.https({
      host: domain,
      path: '/api/v1/json',
      headers: {
        Authorization: this.getBasicAuthValue({ userName, apiKey }),
      },
    });
  }

  private async retrieveLeadFromCache({ leadId }: { leadId: string }) {
    const cachedLead = await this.cacheManager.get<IAbbreviatedLead>(leadId);
    if (
      cachedLead !== null &&
      typeof cachedLead === 'object' &&
      typeof cachedLead.rev === 'string' &&
      typeof cachedLead.description === 'string'
    )
      return cachedLead;
    return null;
  }

  private async cacheLead({
    leadId,
    rev,
    description,
  }: {
    leadId: string;
    rev: string;
    description: string;
  }) {
    return await this.cacheManager.set(
      leadId,
      { description, rev },
      TEN_MINUTES_IN_MS,
    );
  }

  private async refreshLead({
    leadId,
    ref,
  }: {
    leadId: string;
    ref: ACCOUNT_REF;
  }) {
    const client = await this.generateClient(ref);
    const response = await client.request('getLead', { leadId });

    if (!validateGetLeadResponse(response)) {
      throw new CrmError('Refresh lead response failed validation', false);
    }
    const { description, rev } = response.result;

    await this.cacheLead({ leadId, rev, description });
    return { description, rev };
  }

  async getLead({ leadId, ref }: { leadId: string; ref: ACCOUNT_REF }) {
    const cachedLead = await this.retrieveLeadFromCache({ leadId });
    if (cachedLead !== null) return cachedLead;

    const { description, rev } = await this.refreshLead({ leadId, ref });

    return { description, rev };
  }

  async updateLead({
    leadId,
    ref,
    updates,
  }: {
    leadId: string;
    ref: ACCOUNT_REF;
    updates: any;
  }): Promise<{ description: string; rev: string }> {
    const validateUpdateLeadResponseAndCache = async (response: any) => {
      if (!ValidateUpdateLeadResponse(response)) {
        throw new InternalServerErrorException(
          'Lead did not update as expected',
        );
      }

      const { description, rev: updatedRev } = response.result;
      await this.cacheLead({ leadId, rev: updatedRev, description });
      return { description, rev: updatedRev };
    };

    try {
      const { rev } = await this.getLead({ leadId, ref });
      const client = await this.generateClient(ref);
      const response = await client
        .request('editLead', {
          leadId,
          rev,
          updates,
        })
        .catch(async (reason) => {
          Sentry.withScope((scope) => {
            scope.setExtra('leadId', leadId);
            Sentry.captureException(reason);
          });
          if (reason.error) {
            const { code, message } = reason.error;
            if (code === 409 && message === 'rev key is out-of-date') {
              const { rev } = await this.refreshLead({
                leadId,
                ref,
              });

              const response = await client.request('editLead', {
                leadId,
                rev,
                updates,
              });

              return await validateUpdateLeadResponseAndCache(response);
            }
          }
        });

      return await validateUpdateLeadResponseAndCache(response);
    } catch (err) {
      console.error('err', err);
      throw err;
    }
  }

  async createLead<CustomFields>({
    ref,
    lead,
    orderName,
  }: {
    ref: ACCOUNT_REF;
    lead: ICreateLead<CustomFields>;
    orderName: string;
  }): Promise<string> {
    try {
      const client = await this.generateClient(ref);
      const resp = await client.request('newLead', lead);

      if (!validateCreateLeadResponse(resp)) {
        throw new CrmError('Create lead response failed validation', false);
      }

      return resp.result.id.toString();
    } catch (err: any) {
      Sentry.withScope((scope) => {
        scope.setExtra('order name', orderName);
        scope.setExtra('ref', ref);
        scope.setExtra('lead', lead);
        scope.setExtra('message', 'Nutshell newLead failed');
        Sentry.captureException(err);
      });

      throw new CrmError(err.message || 'Lead insert failed', true);
    }
  }

  async addTaskToEntity({
    ref,
    task,
  }: {
    ref: ACCOUNT_REF;
    task: IAddTaskToEntity;
  }) {
    try {
      const client = await this.generateClient(ref);
      const resp = await client.request('newTask', {
        task,
      });
      return resp;
    } catch (err: any) {
      Sentry.withScope((scope) => {
        scope.setExtra('entity', task.task.entity);
        scope.setExtra('ref', ref);
        scope.setExtra('message', 'Nutshell newTask failed');
        Sentry.captureException(err);
      });

      throw new CrmError(err.message || 'Lead insert failed', true);
    }
  }

  async getProducts({ ref }: { ref: ACCOUNT_REF }) {
    const client = await this.generateClient(ref);
    const response = await client
      .request('findProducts', { limit: 100 })
      .catch((reason) => {
        console.error('Get products failed', reason);
        throw reason;
      });
    // return response.result.map((product) => product.name);
    return response.result.map((product) => ({
      name: product.name,
      id: product.id,
    }));
  }
}

/**
 * implement note:
 * curl -u <domain or username>:<api token> \
-d '{ "id": "<id>", "method": "getLead", "params": { "leadId": 1000 } }' \
https://app.nutshell.com/api/v1/json
 */
