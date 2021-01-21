import kleur from 'kleur';
import {AllCredentials} from 'types';
import {ServiceNames, services} from '../constants';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Input} = require('enquirer');

export async function promptForApiKey(
  serviceName: keyof typeof ServiceNames,
  allCredentials: AllCredentials
): Promise<string> {
  const service = services[serviceName];

  console.log(`You can find keys at ${kleur.bold(service.keyPage)}`);

  const prompt = new Input({
    name: 'apiKey',
    message: `${serviceName} API Key:`,
    initial: allCredentials[serviceName].apiKey,
  });

  const key = await prompt.run();

  return String(key).trim();
}
