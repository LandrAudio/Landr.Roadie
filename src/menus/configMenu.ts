import {clear} from 'console';
import {InitializedApisType} from 'types';
import homeMenu from './homeMenu';
import updateCredentialsMenu from './updateCredentialsMenu';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Select} = require('enquirer');

export default async function configMenu(
  services: InitializedApisType
): Promise<void> {
  clear();
  const choices = [
    {
      message: `[U]pdate credentials`,
      name: 'credentials',
      shortcut: 'U',
    },
    {
      message: `Go [B]ack`,
      name: 'back',
      shortcut: 'B',
    },
  ];

  const questions = {
    type: 'select',
    name: 'action',
    message: 'Config:',
    choices,
  };

  const prompt = new Select(questions);

  prompt.on('keypress', (rawKey: string) => {
    const foc = prompt.state.choices.find(
      (c) => c.shortcut && c.shortcut === rawKey
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
      return updateCredentialsMenu(services);
    case 'back':
      return homeMenu(services);
    default:
      break;
  }
}
