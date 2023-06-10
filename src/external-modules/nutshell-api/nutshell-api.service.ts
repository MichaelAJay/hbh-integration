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

  private getResult(response: any): any {
    if (!response.result) {
      throw new Error('Bad response');
    }
    return response.result;
  }

  private getBasicAuthValue({
    userName,
    apiKey,
  }: {
    userName: string;
    apiKey: string;
  }) {
    console.log('userName and apiKey in auth token creator', userName, apiKey);
    /**
     * Return Base64-encoded string <username>:<apikey>
     */
    return `Basic ${Buffer.from(`${userName}:${apiKey}`).toString('base64')}`;
  }

  private getUserNameAndApiKeyForAcct(ref: string) {
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
  private async generateClient(ref: string) {
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

  /**
   * Specific route implementations below
   * Steps:
   * 1) GetApiForUserName
   * 2) GetBasicAuth by acct prefix
   * 3) Send request to URL from step 1 w/ Basic auth from step 2
   */

  async getLead(ref: string) {
    const client = await this.generateClient(ref);
    await client.request('getLead', { leadId: 1000 });
  }

  async createLead({ ref, lead }: { ref: string; lead }) {
    const client = await this.generateClient(ref);
    await client.request('newLead', { lead: lead });
  }

  async getProducts({ ref }: { ref: any }) {
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

  /**
   * Test process
   */
  async add({ ref, a, b }: { ref: string; a: number; b: number }) {
    try {
      const client = await this.generateClient(ref);
      console.log('client', client);

      client.on('request', function (req) {
        console.log(req);
      });
      const response = await client.request('add', [a, b]).catch((reason) => {
        console.error('Client request failed', reason);
        throw reason;
      });
      const result = this.getResult(response);
      console.log('result', result);
      return result;
    } catch (err) {
      throw err;
    }
  }
}

/**
 * implement note:
 * curl -u <domain or username>:<api token> \
-d '{ "id": "<id>", "method": "getLead", "params": { "leadId": 1000 } }' \
https://app.nutshell.com/api/v1/json
 */
