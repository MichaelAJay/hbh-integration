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

  async getApiForUsername(username: string) {
    const userCachedDomain = await this.cacheManager.get(username);
    if (userCachedDomain) return userCachedDomain;

    const client = jayson.Client.http({ host: 'api.nutshell.com' });
    const response = await client.request('getApiForUsername', { username });
    const selectedDomain = this.selectDomain(response.result);
    await this.cacheManager.set(username, selectedDomain, this.cacheTTL_in_MS);
    return selectedDomain;
  }

  private selectDomain(response: any) {
    // if (!(Array.isArray(domains) && domains.length > 0)) {
    //   const msg = 'Expected domains to be non-empty array';
    //   const logInput: { type: string; isArray: boolean; arrayLength?: number } =
    //     {
    //       type: typeof domains,
    //       isArray: Array.isArray(domains),
    //     };
    //   if (logInput.isArray) {
    //     logInput.arrayLength = domains.length;
    //   }
    //   this.logger.error(msg, logInput);
    //   throw new UnprocessableEntityException(msg);
    // }
    // /**
    //  * Selection criteria: (subject to change)
    //  */
    // const targetDomain = domains.find(
    //   (domain) => typeof domain === 'string' && domain.includes('api'),
    // );
    if (this.isResponseValid(response)) {
      return (response as { result: { api: string } }).result.api;
    } else {
      const msg = 'Api domain not successfully found';
      this.logger.error(msg, {});
      throw new UnprocessableEntityException(msg);
    }
  }

  private isResponseValid(response: any) {
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

  private getBasicAuth(acctEnvVarPrefix: string) {
    const {
      NUTSHELL_USERNAME_POSTFIX: userNamePostfix,
      NUTSHELL_API_KEY_POSTFIX: apiKeyPostfix,
    } = process.env;

    if (!(userNamePostfix && apiKeyPostfix)) {
      const msg = 'Missing necessary system configuration variables';
      this.logger.error(msg, { userNamePostfix, apiKeyPostfix });
      throw new InternalServerErrorException(msg);
    }

    const userNameEnvVarName = `${acctEnvVarPrefix}_${userNamePostfix}`;
    const apiKeyEnvVarName = `$${acctEnvVarPrefix}_${apiKeyPostfix}`;
    const userName = process.env[userNameEnvVarName];
    const apiKey = process.env[apiKeyEnvVarName];

    if (!(userName && apiKey)) {
      const msg = 'Missing neccessary client configuration variables';
      this.logger.error(msg, {
        ref: acctEnvVarPrefix,
        userNameEnvVarName,
        apiKeyEnvVarName,
        userName,
        apiKey,
      });
      throw new InternalServerErrorException(msg);
    }

    /**
     * Return Base64-encoded string <username>:<apikey>
     */
    return Buffer.from(`${userName}:${apiKey}`).toString('base64');
  }

  /**
   * Specific route implementations below
   * Steps:
   * 1) GetApiForUserName
   * 2) GetBasicAuth by acct prefix
   * 3) Send request to URL from step 1 w/ Basic auth from step 2
   */
}
