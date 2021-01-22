import clear from 'clear';
import {InitializedApisType} from 'types';
import environmentsMenu from './environmentsMenu';
import { OctopusProjectType } from 'apis';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {AutoComplete} = require('enquirer');

export default async function releasesMenu(
  services: InitializedApisType,
  project: OctopusProjectType,
): Promise<void> {
  clear();

  const releases = await services.Octopus.fetchReleasesForProject(project.Id);

  if (releases) {
    const prompt = new AutoComplete({
      name: 'releases',
      message: 'Choose release',
      choices: releases.Items.map((release) => release.Version),
    });

    const answer = await prompt.run().then((answer) => {
      console.log('Release:', answer);
      return answer;
    });

    const release = releases.Items.find((release) => release.Version == answer);

    if (release) {
      return environmentsMenu(services, project, release);
    }
  }
}
