import keytar from 'keytar';
import kleur from 'kleur';
import {promptForApiKey} from 'menus/promptForApiKey';
import promptForUsername from 'menus/promptForUsername';
import {AllCredentials, Credentials, InitializedApisType as InitializedApisType} from 'types';
import {
  ACCOUNT_PASSWORD_KEY,
  ACCOUNT_NAME_KEY,
  ApiNames,
  ALL_APIS,
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

async function testApiCredentials(
  apiName: keyof typeof ApiNames,
  credentials: Credentials
): Promise<boolean> {
  let isValid = true;
  try {
    await ALL_APIS[apiName].testCredentials(credentials);
  } catch (error) {
    isValid = false;
    console.error(`There was an error while checking credentials`);
    console.error(error);
  }
  return isValid
}

async function retryForValidKey(
  apiName: keyof typeof ApiNames,
  allCredentials: AllCredentials
): Promise<Credentials> {
  console.log(
    `The credentials for ${kleur.blue(apiName)} do not appear to be valid`
  );

  const username = await promptForUsername(apiName, allCredentials);
  const apiKey = await promptForApiKey(apiName, allCredentials);

  const isValid = await testApiCredentials(apiName, {username, apiKey});

  if (isValid) {
    return {apiKey, username};
  }

  return retryForValidKey(apiName, {
    ...allCredentials,
    [apiName]: {username, apiKey},
  });
}

async function getValidCredentials(
  allCredentials: AllCredentials,
  apiName: keyof typeof ApiNames
): Promise<Credentials> {
  const credentials = allCredentials[apiName];
  const isValid =
    !credentials.apiKey || !credentials.apiKey
      ? false
      : await testApiCredentials(apiName, credentials);

  if (isValid) {
    return credentials;
  }

  return retryForValidKey(apiName, allCredentials);
}

export default async function initializeApis(): Promise<InitializedApisType> {
  console.log(kleur.blue().italic('Checking for API credentials...'));

  let initializedApis = {};
  let allCredentials = getEmptyCredentials();

  for (const apiName in ApiNames) {
    const username = await keytar.getPassword(
      apiName,
      ACCOUNT_PASSWORD_KEY
    );
    const apiKey = await keytar.getPassword(apiName, ACCOUNT_PASSWORD_KEY);

    allCredentials = {
      ...allCredentials,
      [apiName]: {username, apiKey},
    };

    const validatedCredentials = await getValidCredentials(
      allCredentials,
      apiName as keyof typeof ApiNames
    );

    if (validatedCredentials.username !== username) {
      await keytar.setPassword(
        apiName,
        ACCOUNT_NAME_KEY,
        validatedCredentials.username
      );
    }

    if (validatedCredentials.apiKey !== apiKey) {
      await keytar.setPassword(
        apiName,
        ACCOUNT_PASSWORD_KEY,
        validatedCredentials.apiKey
      );
    }

    allCredentials = {
      ...allCredentials,
      [apiName]: validatedCredentials,
    };

    const initializedApi = new ALL_APIS[apiName](validatedCredentials);

    initializedApis = {
      ...initializedApis,
      [apiName]: initializedApi,
    };

    console.log(`${apiName}: ${kleur.green('Okay!')}`);
  }

  console.log();
  console.log(kleur.green('All API credentials are valid!'));
  console.log();

  return initializedApis as InitializedApisType;
}
