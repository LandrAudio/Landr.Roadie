import {InitializedApisType} from 'types';
import configMenu from './configMenu';
import projectsMenu from './projectsMenu';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {Select} = require('enquirer');

export default async function postDemploymentMenu(
  services: InitializedApisType
): Promise<void> {
  const choices = [
    {
      message: 'Another [D]eployment',
      name: 'deploy',
      shortcut: 'D',
    },
    {
      message: 'Return [H]ome',
      name: 'home',
      shortcut: 'H',
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
        d: 'shortcut',
        h: 'shortcut',
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
      return projectsMenu(services);
    case 'home':
      return configMenu(services);
    default:
      break;
  }
}
