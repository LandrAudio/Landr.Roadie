import kleur from 'kleur';
import {ApiNames, AllCredentialsType} from 'types';
import {APIS} from '../constants';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Input} = require('enquirer');

export async function promptForApiKey(
  serviceName: ApiNames,
  allCredentials: AllCredentialsType
): Promise<string> {
  const service = APIS[serviceName];

  console.log(`You can find keys at ${kleur.bold(service.keyPage)}`);

  const prompt = new Input({
    name: 'apiKey',
    message: `${serviceName} API Key:`,
    initial: allCredentials[serviceName].apiKey,
  });

  const key = await prompt.run();

  return String(key).trim();
}
