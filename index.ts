import kleur from 'kleur';
import keytar from 'keytar';
import Store from 'data-store';
import axios, {AxiosRequestConfig} from 'axios';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Input} = require('enquirer');

const ACCOUNT_PASSWORD = 'landr-account-password';
const ACCOUNT_NAME = 'landr-account-name';

enum ServiceNames {
  Octopus = 'Octopus',
  Jira = 'Jira'
}

type Credentials = {
  readonly username: string;
  readonly apiKey: string;
};

type AllCredentials = {
  readonly [key in keyof typeof ServiceNames]: Credentials;
};

function getEmptyCredentials(): AllCredentials {
  return {
    Octopus: {
      username: '',
      apiKey: ''
    },
    Jira: {
      username: '',
      apiKey: ''
    }
  };
}

abstract class API {
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
        password: credentials.apiKey
      }
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

class OctopusAPI extends API {
  static baseUrl = 'https://octopus.landr.com/';
  static keyPage = 'https://octopus.landr.com/app#/users/me/apiKeys';
  public static keyOnlyAuthentication = true;
  static async testCredentials(credentials: Credentials): Promise<void> {
    await axios.get('/api/users/me', this.getBaseRequestConfig(credentials));
  }
  protected static getBaseRequestConfig(
    credentials: Credentials
  ): AxiosRequestConfig {
    return {
      baseURL: this.baseUrl,
      headers: {
        'X-Octopus-ApiKey': credentials.apiKey
      }
    };
  }
  constructor(credentials: Credentials) {
    super(credentials);
  }
}

class JiraAPI extends API {
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

const services = {
  [ServiceNames.Octopus]: OctopusAPI,
  [ServiceNames.Jira]: JiraAPI
};

type InitializedServicesType = {
  [ServiceNames.Octopus]: OctopusAPI;
  [ServiceNames.Jira]: JiraAPI;
};

async function promptForUsername(
  serviceName: keyof typeof ServiceNames,
  allCredentials: AllCredentials
): Promise<string> {
  const prompt = new Input({
    name: 'username',
    message: `${serviceName} Username:`,
    initial: allCredentials[serviceName].username,
    history: {
      store: new Store({path: `${__dirname}/username.json`}),
      autosave: true
    }
  });

  const key = await prompt.run();

  return String(key).trim();
}

async function promptForApiKey(
  serviceName: keyof typeof ServiceNames,
  allCredentials: AllCredentials
): Promise<string> {
  const service = services[serviceName];

  console.log(`You can find keys at ${kleur.bold(service.keyPage)}`);

  const prompt = new Input({
    name: 'apiKey',
    message: `${serviceName} API Key:`,
    initial: allCredentials[serviceName].apiKey
  });

  const key = await prompt.run();

  return String(key).trim();
}

function startWork(services: InitializedServicesType): void {
  console.log('meow');
  console.log(services);
  return;
}

async function testServiceCredentials(
  serviceName: keyof typeof ServiceNames,
  credentials: Credentials
): Promise<boolean> {
  let isValid = true;
  try {
    await services[serviceName].testCredentials(credentials);
  } catch (error) {
    isValid = false;
    console.log(error);
    console.log(isValid);
  }
  return isValid;
}

async function retryForValidKey(
  serviceName: keyof typeof ServiceNames,
  allCredentials: AllCredentials
): Promise<Credentials> {
  console.log(
    `The credentials for ${kleur.blue(serviceName)} do not appear to be valid`
  );

  const username = await promptForUsername(serviceName, allCredentials);
  const apiKey = await promptForApiKey(serviceName, allCredentials);

  const isValid = await testServiceCredentials(serviceName, {username, apiKey});

  if (isValid) {
    return {apiKey, username};
  }

  return retryForValidKey(serviceName, {
    ...allCredentials,
    [serviceName]: {username, apiKey}
  });
}

async function getValidCredentials(
  allCredentials: AllCredentials,
  serviceName: keyof typeof ServiceNames
): Promise<Credentials> {
  const credentials = allCredentials[serviceName];
  const isValid =
    !credentials.apiKey || !credentials.apiKey
      ? false
      : await testServiceCredentials(serviceName, credentials);

  if (isValid) {
    return credentials;
  }

  return retryForValidKey(serviceName, allCredentials);
}

async function initializeServices(): Promise<InitializedServicesType> {
  let initializedServices = {};
  let allCredentials = getEmptyCredentials();

  for (const serviceName in ServiceNames) {
    const username = await keytar.getPassword(serviceName, ACCOUNT_NAME);
    const apiKey = await keytar.getPassword(serviceName, ACCOUNT_PASSWORD);

    allCredentials = {
      ...allCredentials,
      [serviceName]: {username, apiKey}
    };

    const validatedCredentials = await getValidCredentials(
      allCredentials,
      serviceName as keyof typeof ServiceNames
    );

    if (validatedCredentials.username !== username) {
      await keytar.setPassword(
        serviceName,
        ACCOUNT_NAME,
        validatedCredentials.username
      );
    }

    if (validatedCredentials.apiKey !== apiKey) {
      await keytar.setPassword(
        serviceName,
        ACCOUNT_PASSWORD,
        validatedCredentials.apiKey
      );
    }

    allCredentials = {
      ...allCredentials,
      [serviceName]: validatedCredentials
    };

    const initializedService = new services[serviceName](validatedCredentials);

    initializedServices = {
      ...initializedServices,
      [serviceName]: initializedService
    };
  }

  console.log('All keys are valid!');

  return initializedServices as InitializedServicesType;
}

async function init(): Promise<void> {
  // SETUP FLOW // CHECK FOR API KEYS WITH KEYTAR
  console.log(kleur.blue().italic('Checking for API keys...'));

  const initializedServices = await initializeServices().then(x => x);

  startWork(initializedServices);
}

init();
