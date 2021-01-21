import kleur from 'kleur';
import {AllCredentials} from 'types';
import {ApiNames, ALL_APIS} from '../constants';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Input} = require('enquirer');

export async function promptForApiKey(
  serviceName: keyof typeof ApiNames,
  allCredentials: AllCredentials
): Promise<string> {
  const service = ALL_APIS[serviceName];

  console.log(`You can find keys at ${kleur.bold(service.keyPage)}`);

  const prompt = new Input({
    name: 'apiKey',
    message: `${serviceName} API Key:`,
    initial: allCredentials[serviceName].apiKey,
  });

  const key = await prompt.run();

  return String(key).trim();
}
