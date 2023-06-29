import { CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import * as jayson from 'jayson/promise';
import { Cache } from 'cache-manager';
import { CustomLoggerService } from 'src/support-modules/custom-logger/custom-logger.service';
import { IAddTaskToEntity, IUpsertLead } from './interfaces/requests';
import { ACCOUNT_REF } from 'src/internal-modules/external-interface-handlers/database/account-db-handler/types';
import * as Sentry from '@sentry/node';
import { CrmError } from 'src/common/classes';
import {
  validateCreateLeadResponse,
  validateGetLeadResponse,
  ValidateUpdateLeadResponse,
} from './interfaces/responses';
import { IAbbreviatedLead } from './interfaces';
import { Entity, NutshellApiMethod } from './types';
import { INVALID_REV_KEY } from './constants';
import {
  IDeleteLeadResponse,
  ValidateDeleteLeadResponse,
} from './interfaces/responses/delete-lead.response-interface';
import { ICreateLeadReturn } from './interfaces/returns';
import { ProductIdSumExclusions } from 'src/internal-modules/external-interface-handlers/crm/accounts/utility';

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
   * PUBLIC METHODS
   */
  async getLead({
    leadId,
    ref,
    client,
  }: {
    leadId: number;
    ref: ACCOUNT_REF;
    client?: jayson.HttpsClient;
  }) {
    const cachedLead = await this.retrieveLeadFromCache({
      leadId,
    });
    if (cachedLead !== null) return cachedLead;

    const { description, rev } = await this.refreshLead({
      leadId,
      ref,
      client,
    });

    return { description, rev };
  }

  /**
   * updates should be of the form found in the accompanying test suite, var leadDetails2
   * @TODO - get return
   */
  async updateLead<CustomFields>({
    leadId,
    ref,
    lead,
  }: {
    leadId: number;
    ref: ACCOUNT_REF;
    lead: IUpsertLead<CustomFields>;
  }): Promise<{ description: string }> {
    const validateUpdateLeadResponseAndCache = async (
      response: any,
    ): Promise<{ description: string; rev: string }> => {
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
      const response = await this.tryTwice<any>({
        ref,
        apiMethod: 'editLead',
        params: { leadId, ...lead },
        entityId: leadId,
        entityType: 'Lead',
      });

      if (!validateUpdateLeadResponseAndCache(response)) {
        const err = new CrmError('Updated lead not validated & cached');
        Sentry.captureException(err);
        err.isLogged = true;
        throw err;
      }
      return { description: response.result.description };
    } catch (err) {
      throw err;
    }
  }

  async createLead<CustomFields>({
    ref,
    lead,
    orderName,
  }: {
    ref: ACCOUNT_REF;
    lead: IUpsertLead<CustomFields>;
    orderName: string;
  }): Promise<ICreateLeadReturn> {
    try {
      const client = await this.generateClient(ref);
      const resp = await client.request('newLead', lead);

      if (!validateCreateLeadResponse(resp)) {
        throw new CrmError('Create lead response failed validation', false);
      }

      const productIdForSumExclusions =
        ProductIdSumExclusions[ref].map((el) => parseInt(el, 10)) || [];

      const ret: ICreateLeadReturn = {
        id: resp.result.id.toString(),
        description: resp.result.description,
        products: resp.result.products
          .filter((product) => !productIdForSumExclusions.includes(product.id))
          .map((product) => ({
            amountInUsd:
              parseFloat(product.price.amount.toFixed(2)) * product.quantity,
          })),
      };
      if (resp.result.tags.length > 0) {
        ret.tags = resp.result.tags;
      }

      return ret;
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

  async deleteLead({ leadId, ref }: { leadId: number; ref: ACCOUNT_REF }) {
    try {
      const response = await this.tryTwice<IDeleteLeadResponse>({
        ref,
        apiMethod: 'deleteLead',
        params: { leadId },
        entityId: leadId,
        entityType: 'Lead',
      });

      if (!ValidateDeleteLeadResponse(response)) {
        const err = new CrmError('Delete lead returned unexpected response');
        Sentry.withScope((scope) => {
          scope.setExtra('response', response);
          Sentry.captureException(err);
        });
        err.isLogged = true;
        throw err;
      }
      return response.result;
    } catch (err) {
      throw err;
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
        throw reason;
      });
    // return response.result.map((product) => product.name);
    return response.result.map((product) => ({
      name: product.name,
      id: product.id,
    }));
  }

  /**
   * PRIVATE METHODS
   */

  private async getApiForUsername({
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
        throw reason;
      });
    const selectedDomain = this.selectDomain(response);
    await this.cacheManager
      .set(userName, selectedDomain, this.cacheTTL_in_MS)
      .catch((reason) => {
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
        const err = new CrmError('Api domain not successfully found');
        Sentry.captureException(err);
        err.isLogged = true;
        throw err;
      }
    } catch (err) {
      throw err;
    }
  }

  private isGetApiForUsernameResponseValid(response: any) {
    /**
     * This could have logs that tell a better story
     */
    const responseType = typeof response;
    if (responseType !== 'object') {
      const err = new CrmError('Response is not object as expected');
      Sentry.withScope((scope) => {
        scope.setExtra('responseType', responseType);
        Sentry.captureException(err);
      });
      err.isLogged = true;
      throw err;
    }

    const { result } = response;
    const resultType = typeof result;
    if (resultType !== 'object') {
      const err = new CrmError('Response.result is not object as expected');
      Sentry.withScope((scope) => {
        scope.setExtra('response.result', resultType);
        Sentry.captureException(err);
      });
      err.isLogged = true;
      throw err;
    }

    const { api } = result;
    const apiType = typeof api;
    if (apiType !== 'string') {
      const err = new CrmError('Response.result.api is not string as expected');
      Sentry.withScope((scope) => {
        scope.setExtra('apiType', apiType);
        Sentry.captureException(err);
      });
      err.isLogged = true;
      throw err;
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
      const err = new CrmError(
        'Missing necessary system configuration variables',
      );
      Sentry.withScope((scope) => {
        scope.setExtras({
          NUTSHELL_USERNAME_POSTFIX: userNamePostfix,
          NUTSHELL_API_KEY_POSTFIX: apiKeyPostfix,
        });
        Sentry.captureException(err);
      });
      err.isLogged = true;
      throw err;
    }

    const userNameEnvVarName = `${ref}_${userNamePostfix}`;
    const apiKeyEnvVarName = `${ref}_${apiKeyPostfix}`;
    const userName = process.env[userNameEnvVarName];
    const apiKey = process.env[apiKeyEnvVarName];

    if (!(typeof userName === 'string' && typeof apiKey === 'string')) {
      const message = `Client configuration variables not found for REF ${ref}`;
      const err = new CrmError(message);
      Sentry.withScope((scope) => {
        scope.setExtras({
          ref: ref,
          userNameEnvVarName,
          apiKeyEnvVarName,
          userName,
          apiKey,
        });
        Sentry.captureException(err);
        err.isLogged = true;
        throw err;
      });
    }
    return { userName: userName as string, apiKey: apiKey as string };
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

  private async retrieveLeadFromCache({ leadId }: { leadId: number }) {
    const cachedLead = await this.cacheManager.get<IAbbreviatedLead>(
      leadId.toString(),
    );
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
    leadId: number;
    rev: string;
    description: string;
  }) {
    return await this.cacheManager.set(
      leadId.toString(),
      { description, rev },
      TEN_MINUTES_IN_MS,
    );
  }

  private async refreshLead({
    leadId,
    ref,
    client,
  }: {
    leadId: number;
    ref: ACCOUNT_REF;
    client?: jayson.HttpsClient;
  }) {
    if (!client) {
      client = await this.generateClient(ref);
    }
    const response = await client.request('getLead', { leadId });
    if (
      typeof response === 'object' &&
      response.hasOwnProperty('result') &&
      response.result === null
    ) {
      const err = new CrmError(`Lead ${leadId} not found`);
      Sentry.captureException(err);
      err.isLogged = true;
      throw err;
    }

    if (!validateGetLeadResponse(response)) {
      throw new CrmError('Refresh lead response failed validation', false);
    }
    const { description, rev } = response.result;

    await this.cacheLead({ leadId, rev, description });
    return { description, rev };
  }

  /**
   * tryTwice is used on descructive methods that require the current rev
   */
  private async tryTwice<T>({
    ref,
    apiMethod,
    params,
    entityId,
    entityType,
  }: {
    ref: ACCOUNT_REF;
    apiMethod: NutshellApiMethod;
    params: any;
    entityId: number;
    entityType: Entity;
  }): Promise<T> {
    const client = await this.generateClient(ref);
    try {
      let rev: string;
      switch (entityType) {
        case 'Lead':
          const { rev: leadRev } = await this.getLead({
            leadId: entityId,
            ref,
            client,
          });
          rev = leadRev;
          break;

        default:
          const crmError = new CrmError(
            `Invalid entity type ${entityType} at tryTwice get switch`,
          );
          Sentry.captureException(crmError);
          crmError.isLogged = true;
          throw crmError;
      }

      const response = await client.request(apiMethod, { ...params, rev });

      return response;
    } catch (err: any) {
      /**
       * This is in place to make sure I'm understanding the return I'm supposed to receive
       */
      Sentry.withScope((scope) => {
        scope.setExtra('apiMethod', apiMethod);
        Sentry.captureException(err);
      });

      if (err.code && err.code === 409) {
        const { message } = err;
        if (message.includes(INVALID_REV_KEY)) {
          switch (entityType) {
            case 'Lead':
              const refreshedLead = await this.refreshLead({
                leadId: entityId,
                ref,
              });
              params.rev = refreshedLead.rev;
              break;
            default:
              Sentry.captureMessage(`Ineligible entity type ${entityType}`);
              throw err;
          }

          const response = await client.request(apiMethod, params);
          return response;
        } else {
          Sentry.withScope((scope) => {
            scope.setExtra('message', 'Unexpected 409 error from Nutshell');
            Sentry.captureException(err);
          });
          throw err;
        }
      } else {
        throw err;
      }
    }
  }
}
