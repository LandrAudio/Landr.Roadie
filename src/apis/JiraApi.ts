import axios from "axios";
import { API, Credentials } from "types";

export default class JiraAPI extends API {
  static baseUrl = 'https://mixgenius.atlassian.net';
  static keyPage = 'https://id.atlassian.com/manage/api-tokens';
  static async testCredentials(credentials: Credentials): Promise<void> {
    await axios.get(
      '/rest/api/3/myself',
      this.getBaseRequestConfig(credentials)
    );
  }
  constructor(credentials: Credentials) {
    super(credentials);
  }
}
