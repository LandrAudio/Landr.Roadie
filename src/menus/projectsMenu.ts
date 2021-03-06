import clear from 'clear';
import kleur from 'kleur';
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
      message: `Choose project: ${kleur.dim(
        'Use arrows keys to navigate, or type to filter'
      )}`,
      choices: projects.map((project) => project.Name),
      limit: 20,
      footer: kleur.dim(
        `(${projects.length} total projects, scroll up and down for more)`
      ),
    });

    const answer = await prompt.run().then((answer) => {
      return answer;
    });

    const project = projects.find((release) => release.Name === answer);

    if (project) {
      return releasesMenu(services, project);
    }
  }
}
