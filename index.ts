import kleur from 'kleur';
import keytar from 'keytar';
import Store from 'data-store';
import clear from 'clear';
// import clui from 'clui';
import axios, {AxiosRequestConfig} from 'axios';
import { keysIn } from 'ramda';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Input, Select} = require('enquirer');

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

async function updateCredentialsMenu(
  services: InitializedServicesType
): Promise<void> {
  clear();
  const servicesChoices = Object.keys(services).map((key: string) => {
    return {
      message: `Update ${key}`,
      name: 'key'
    };
  });

  const choices = [
    ...servicesChoices,
    {
      message: `Go [B]ack`,
      name: 'back',
      shortcut: 'B'
    }
  ];

  const questions = {
    type: 'select',
    name: 'action',
    message: 'Update Credentials',
    choices
  };

  const prompt = new Select(questions);

  prompt.on('keypress', rawKey => {
    const foc = prompt.state.choices.find(
      c => c.shortcut && c.shortcut === rawKey
    );

    if (foc) {
      prompt.state.index = foc.index;
      prompt.submit();
    }
  });

  const answers = await prompt.run();

  clear();

  switch (answers) {
    case 'back':
      await configMenu(services);
    default:
      break;
  }
}

async function configMenu(services: InitializedServicesType): Promise<void> {
  clear();
  const choices = [
    {
      message: `[U]pdate credentials`,
      name: 'credentials',
      shortcut: 'U'
    },
    {
      message: `Go [B]ack`,
      name: 'back',
      shortcut: 'B'
    }
  ];

  const questions = {
    type: 'select',
    name: 'action',
    message: 'Config:',
    choices
  };

  const prompt = new Select(questions);


  prompt.on('keypress', rawKey => {
    const foc = prompt.state.choices.find(
      c => c.shortcut && c.shortcut === rawKey
    );

    if (foc) {
      prompt.state.index = foc.index;
      prompt.submit();
    }
  });

  const answers = await prompt.run();

  clear();

  switch (answers) {
    case 'credentials':
      await updateCredentialsMenu(services);
      break;
    case 'back':
      await basicMenu(services);
      return;
    default:
      break;
  }
}

async function basicMenu(services: InitializedServicesType): Promise<void> {
  const choices = [
    {
      message: '[C]onfig',
      name: 'config',
      shortcut: 'C'
    },
    {
      message: '[Q]uit',
      name: 'quit',
      shortcut: 'Q'
    }
  ];

  const questions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    choices
  };

  const prompt = new Select(questions);

  prompt.on('keypress', rawKey => {
    const foc = prompt.state.choices.find(
      c => c.shortcut && c.shortcut === rawKey
    );

    if (foc) {
      prompt.state.index = foc.index;
      prompt.submit();
    }
  });

  const answers = await prompt.run();

  switch (answers) {
    case 'config':
      configMenu(services);
      break;
    case 'quit':
      return;
    default:
      break;
  }
}

async function startWork(services: InitializedServicesType): Promise<void> {
  await basicMenu(services);
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
  console.log(kleur.blue().italic('Checking for API credentials...'));

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

    console.log(`${serviceName}: ${kleur.green('Okay!')}`);
  }

  console.log();
  console.log(kleur.green('All API credentials are valid!'));
  console.log();

  return initializedServices as InitializedServicesType;
}

async function init(): Promise<void> {
  clear();
  // SETUP FLOW // CHECK FOR API KEYS WITH KEYTAR
  const initializedServices = await initializeServices().then(x => x);

  await startWork(initializedServices);
  console.log('Exiting...');
}

init();
