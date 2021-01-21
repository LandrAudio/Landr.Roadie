import JiraAPI from 'apis/JiraApi';
import OctopusAPI from 'apis/OctopusApi';
import {ApisType, ApiNames} from 'types';


export const APIS: Record<ApiNames, ApisType> = {
  Octopus: OctopusAPI,
  Jira: JiraAPI,
};

export const ACCOUNT_PASSWORD_KEY = 'landr-account-password';
export const ACCOUNT_NAME_KEY = 'landr-account-name';
