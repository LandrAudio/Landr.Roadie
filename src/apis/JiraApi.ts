import {API, CredentialsType} from 'types';

export default class JiraAPI extends API {
  static baseUrl = 'https://mixgenius.atlassian.net';
  static keyPage = 'https://id.atlassian.com/manage/api-tokens';

  testCredentials(): Promise<unknown> {
    return this.request<unknown>('/rest/api/3/myself');
  }

  constructor(credentials: CredentialsType) {
    super(credentials);
  }
}
