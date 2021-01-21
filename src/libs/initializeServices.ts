import keytar from 'keytar';
import kleur from "kleur";
import { promptForApiKey } from 'menus/promptForApiKey';
import promptForUsername from 'menus/promptForUsername';
import { AllCredentials, Credentials, InitializedServicesType } from "types";
import {
  ACCOUNT_PASSWORD_KEY,
  ACCOUNT_NAME_KEY,
  ServiceNames,
  services,
} from '../constants';

function getEmptyCredentials(): AllCredentials {
  return {
    Octopus: {
      username: '',
      apiKey: '',
    },
    Jira: {
      username: '',
      apiKey: '',
    },
  };
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
    [serviceName]: {username, apiKey},
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

export default async function initializeServices(): Promise<InitializedServicesType> {
  console.log(kleur.blue().italic('Checking for API credentials...'));

  let initializedServices = {};
  let allCredentials = getEmptyCredentials();

  for (const serviceName in ServiceNames) {
    const username = await keytar.getPassword(
      serviceName,
      ACCOUNT_PASSWORD_KEY
    );
    const apiKey = await keytar.getPassword(serviceName, ACCOUNT_PASSWORD_KEY);

    allCredentials = {
      ...allCredentials,
      [serviceName]: {username, apiKey},
    };

    const validatedCredentials = await getValidCredentials(
      allCredentials,
      serviceName as keyof typeof ServiceNames
    );

    if (validatedCredentials.username !== username) {
      await keytar.setPassword(
        serviceName,
        ACCOUNT_NAME_KEY,
        validatedCredentials.username
      );
    }

    if (validatedCredentials.apiKey !== apiKey) {
      await keytar.setPassword(
        serviceName,
        ACCOUNT_PASSWORD_KEY,
        validatedCredentials.apiKey
      );
    }

    allCredentials = {
      ...allCredentials,
      [serviceName]: validatedCredentials,
    };

    const initializedService = new services[serviceName](validatedCredentials);

    initializedServices = {
      ...initializedServices,
      [serviceName]: initializedService,
    };

    console.log(`${serviceName}: ${kleur.green('Okay!')}`);
  }

  console.log();
  console.log(kleur.green('All API credentials are valid!'));
  console.log();

  return initializedServices as InitializedServicesType;
}
