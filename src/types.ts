import JiraAPI from 'apis/JiraApi';
import OctopusAPI from 'apis/OctopusApi';
import axios, {AxiosRequestConfig, Method, AxiosResponse} from 'axios';

export type ApiNames = 'Octopus' | 'Jira';
export type ApisType = typeof JiraAPI | typeof OctopusAPI;
export type CredentialsType = {
  readonly username: string;
  readonly apiKey: string;
};

export type AllCredentialsType = {
  readonly [K in ApiNames]: CredentialsType;
};

export abstract class API {
  apiKey = '';
  username = '';
  baseUrl = '';
  static keyPage: string;
  static keyOnlyAuthentication = false;
  get credentials(): CredentialsType {
    return {
      username: this.username,
      apiKey: this.apiKey,
    };
  }

  get baseRequestConfig(): AxiosRequestConfig {
    return {
      baseURL: this.baseUrl,
      auth: {
        username: this.credentials.username,
        password: this.credentials.apiKey,
      },
    };
  }

  constructor(credentials: CredentialsType) {
    this.apiKey = credentials.apiKey;
    this.username = credentials.username;
  }

  abstract testCredentials(): Promise<unknown>;

  public async request<R>(
    url: string,
    method: Method = 'get',
    data?: unknown
  ): Promise<R | undefined> {
    let results: AxiosResponse<R>;
    try {
      results = await axios.request<R>({
        ...this.baseRequestConfig,
        url,
        method,
        data,
      });
    } catch (error) {
      console.error('API Error: ', error);

      return undefined;
    }

    return results.data;
  }
}

export type InitializedApisType = {
  Octopus: OctopusAPI;
  Jira: JiraAPI;
};

