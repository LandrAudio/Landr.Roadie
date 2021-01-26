import axios, {AxiosRequestConfig, Method, AxiosResponse} from 'axios';
import { CredentialsType } from 'types';

export default abstract class API {
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
    console.log;
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
      console.error('API Error');
      console.error(error);
      if (typeof error === 'object') {
        // Handle Octopus Error
        console.error(
          (error as {response: {data?: {Errors?: []}}})?.response?.data?.Errors
        );
      }

      return undefined;
    }

    return results.data;
  }
}
