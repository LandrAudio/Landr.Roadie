export enum ServiceNames {
  Octopus = 'Octopus',
  Jira = 'Jira',
}

export const services = {
  [ServiceNames.Octopus]: OctopusAPI,
  [ServiceNames.Jira]: JiraAPI,
};

export const ACCOUNT_PASSWORD_KEY = 'landr-account-password';
export const ACCOUNT_NAME_KEY = 'landr-account-name';