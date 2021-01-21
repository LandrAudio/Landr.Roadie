import {AxiosRequestConfig} from 'axios';
import {API, CredentialsType} from 'types';

export default class OctopusAPI extends API {
  baseUrl = 'https://octopus.landr.com/';
  static keyPage = 'https://octopus.landr.com/app#/users/me/apiKeys';
  public static keyOnlyAuthentication = true;

  get baseRequestConfig(): AxiosRequestConfig {
    return {
      baseURL: this.baseUrl,
      headers: {
        'X-Octopus-ApiKey': this.credentials.apiKey,
      },
    };
  }

  testCredentials(): Promise<unknown> {
    return this.request('/api/users/me', 'get', {
      headers: {
        'X-Octopus-ApiKey': this.credentials.apiKey,
      },
    });
  }

  constructor(credentials: CredentialsType) {
    super(credentials);
  }

  async getProjects(): Promise<string | undefined> {
    return this.request<string>('meow');
  }
}
