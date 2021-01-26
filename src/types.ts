import JiraAPI from 'apis/JiraApi';
import OctopusAPI from 'apis/OctopusApi';

export type ApiNames = 'Octopus' | 'Jira';
export type ApisType = typeof JiraAPI | typeof OctopusAPI;
export type CredentialsType = {
  readonly username: string;
  readonly apiKey: string;
};

export type AllCredentialsType = {
  readonly [K in ApiNames]: CredentialsType;
};


export type InitializedApisType = {
  Octopus: OctopusAPI;
  Jira: JiraAPI;
};
