import clear from 'clear';
import {InitializedApisType} from 'types';
import releasesMenu from './releasesMenu';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {AutoComplete} = require('enquirer');

export default async function projectsMenu(
  services: InitializedApisType
): Promise<void> {
  clear();

  const projects = await services.Octopus.fetchProjects();

  if (projects) {
    const prompt = new AutoComplete({
      name: 'projects',
      message: 'Choose project:',
      choices: projects.map((project) => project.Name),
    });

    const answer = await prompt.run().then((answer) => {
      console.log('Selected project:', answer);
      return answer;
    });

    const project = projects.find((release) => release.Name === answer);

    if (project) {
      return releasesMenu(services, project);
    }
  }
}
