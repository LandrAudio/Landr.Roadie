import { InitializedApisType } from "types";
import clear from 'clear';
import configMenu from "./configMenu";
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Select} = require('enquirer');

export default async function updateCredentialsMenu(
  services: InitializedApisType,
): Promise<void> {
  clear();
  const servicesChoices = Object.keys(services).map((key: string) => {
    return {
      message: `Update ${key}`,
      name: 'key',
    };
  });

  const choices = [
    ...servicesChoices,
    {
      message: `Go [B]ack`,
      name: 'back',
      shortcut: 'B',
    },
  ];

  const questions = {
    type: 'select',
    name: 'action',
    message: 'Update Credentials: ',
    choices,
  };

  const prompt = new Select(questions);

  prompt.on('keypress', (rawKey) => {
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
    case 'back':
      await configMenu(services);
    default:
      break;
  }
}
