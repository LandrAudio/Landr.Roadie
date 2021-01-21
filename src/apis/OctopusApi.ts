import axios, {AxiosRequestConfig} from 'axios';
import {API, Credentials} from 'types';

export default class OctopusAPI extends API {
  static baseUrl = 'https://octopus.landr.com/';
  static keyPage = 'https://octopus.landr.com/app#/users/me/apiKeys';
  public static keyOnlyAuthentication = true;
  static async testCredentials(credentials: Credentials): Promise<void> {
    await axios.get('/api/users/me', this.getBaseRequestConfig(credentials));
  }
  protected static getBaseRequestConfig(
    credentials: Credentials
  ): AxiosRequestConfig {
    return {
      baseURL: this.baseUrl,
      headers: {
        'X-Octopus-ApiKey': credentials.apiKey,
      },
    };
  }
  constructor(credentials: Credentials) {
    super(credentials);
  }
}
