import JiraAPI from "apis/JiraApi";
import OctopusAPI from "apis/OctopusApi";

export enum ApiNames {
  Octopus = 'Octopus',
  Jira = 'Jira',
}

export const ALL_APIS = {
  [ApiNames.Octopus]: OctopusAPI,
  [ApiNames.Jira]: JiraAPI,
};

export const ACCOUNT_PASSWORD_KEY = 'landr-account-password';
export const ACCOUNT_NAME_KEY = 'landr-account-name';