import keytar from 'keytar';
import kleur from 'kleur';
import {promptForApiKey} from 'menus/promptForApiKey';
import promptForUsername from 'menus/promptForUsername';
import {
  AllCredentialsType,
  CredentialsType,
  InitializedApisType,
  ApiNames,
} from 'types';
import {ACCOUNT_PASSWORD_KEY, ACCOUNT_NAME_KEY, APIS} from '../constants';

function getEmptyCredentials(): AllCredentialsType {
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
  apiName: ApiNames,
  credentials: CredentialsType
): Promise<boolean> {
  let isValid = true;
  try {
    await new APIS[apiName](credentials).testCredentials();
  } catch (error) {
    isValid = false;
    console.error(`There was an error while checking credentials`);
    console.error(error);
  }
  return isValid;
}

async function retryForValidKey(
  apiName: ApiNames,
  allCredentials: AllCredentialsType
): Promise<CredentialsType> {
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
  allCredentials: AllCredentialsType,
  apiName: ApiNames
): Promise<CredentialsType> {
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

  for (const apiName in APIS) {
    const username = await keytar.getPassword(apiName, ACCOUNT_NAME_KEY);
    const apiKey = await keytar.getPassword(apiName, ACCOUNT_PASSWORD_KEY);

    allCredentials = {
      ...allCredentials,
      [apiName]: {username, apiKey},
    };

    const validatedCredentials = await getValidCredentials(
      allCredentials,
      apiName as ApiNames
    );

    if (validatedCredentials.username !== username) {
      console.log(`Saving new username: ${validatedCredentials.username}`);
      try {
        await keytar.setPassword(
          apiName,
          ACCOUNT_NAME_KEY,
          validatedCredentials.username
        );
      } catch (error) {
        console.error('There was an error saving you new username: ');
        console.error(error);
      }
    }

    if (validatedCredentials.apiKey !== apiKey) {
      console.log('Saving new password');
      try {
        await keytar.setPassword(
          apiName,
          ACCOUNT_PASSWORD_KEY,
          validatedCredentials.apiKey
        );
      } catch (error) {
        console.error('There was an error saving you new password: ');
        console.error(error);
      }
    }

    allCredentials = {
      ...allCredentials,
      [apiName]: validatedCredentials,
    };

    const initializedApi = new APIS[apiName as ApiNames](
      validatedCredentials
    );

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
