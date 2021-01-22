import {InitializedApisType} from 'types';
import configMenu from './configMenu';
import projectsMenu from './projectsMenu';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Select} = require('enquirer');

export default async function homeMenu(
  services: InitializedApisType
): Promise<void> {
  const choices = [
    {
      message: '[C]onfig',
      name: 'config',
      shortcut: 'C',
    },
    {
      message: '[D]eploy',
      name: 'deploy',
      shortcut: 'D',
    },
    {
      message: '[Q]uit',
      name: 'quit',
      shortcut: 'Q',
    },
  ];

  const questions = {
    type: 'select',
    name: 'action',
    message: 'What do you want to do?',
    // The `shortcut` and `actions` here are added to prevent the bell alerts
    // that Enquirer emits. It's a hacky workaround and it might be worth
    // creating a PR or fork of Enquirer to provide more elegant shortcut
    // behaviours.
    shortcut: () => undefined,
    actions: {
      shift: {
        c: 'shortcut',
        q: 'shortcut',
      },
    },
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

  switch (answers) {
    case 'deploy':
      projectsMenu(services);
      return;
    case 'config':
      configMenu(services);
      break;
      return
    case 'quit':
      return;
    default:
      break;
  }
}
