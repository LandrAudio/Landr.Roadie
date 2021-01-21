import JiraAPI from 'apis/JiraApi';
import OctopusAPI from 'apis/OctopusApi';
import {AxiosRequestConfig} from 'axios';
import {ApiNames} from './constants';

export type Credentials = {
  readonly username: string;
  readonly apiKey: string;
};

export type AllCredentials = {
  readonly [key in keyof typeof ApiNames]: Credentials;
};

export abstract class API {
  public apiKey = '';
  public username = '';
  static baseUrl = '';
  static keyPage: string;
  public static keyOnlyAuthentication = false;
  protected static getBaseRequestConfig(
    credentials: Credentials
  ): AxiosRequestConfig {
    return {
      baseURL: this.baseUrl,
      auth: {
        username: credentials.username,
        password: credentials.apiKey,
      },
    };
  }
  static async testCredentials(credentials: Credentials): Promise<void> {
    console.log(credentials.username);
    return Promise.resolve(undefined);
  }
  constructor(credentials: Credentials) {
    this.apiKey = credentials.apiKey;
    this.username = credentials.username;
  }
}

export type InitializedApisType = {
  [ApiNames.Octopus]: OctopusAPI;
  [ApiNames.Jira]: JiraAPI;
};
