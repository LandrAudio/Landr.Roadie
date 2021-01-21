import {AllCredentials} from 'types';
import Store from 'data-store';
import {ServiceNames} from '../constants';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Input} = require('enquirer');

export default async function promptForUsername(
  serviceName: keyof typeof ServiceNames,
  allCredentials: AllCredentials
): Promise<string> {
  const prompt = new Input({
    name: 'username',
    message: `${serviceName} Username:`,
    initial: allCredentials[serviceName].username,
    history: {
      store: new Store({path: `${__dirname}/username.json`}),
      autosave: true,
    },
  });

  const key = await prompt.run();

  return String(key).trim();
}
