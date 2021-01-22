import {
  OctopusPartialDeploymentType,
  OctopusProjectType,
  OctopusReleaseType,
} from 'apis/OctopusApi';
import {formatDistance} from 'date-fns';
import clear from 'clear';
import * as chrono from 'chrono-node';
import kleur from 'kleur';
import {InitializedApisType} from 'types';
// Enquirer doesn't support import syntax
// eslint-disable-next-line
const {AutoComplete} = require('enquirer');

export default async function environmentsMenu(
  services: InitializedApisType,
  project: OctopusProjectType,
  release: OctopusReleaseType
): Promise<void> {
  clear();

  const environments = await services.Octopus.fetchEnvironments();
  const dashboard = await services.Octopus.fetchDashboard();

  if (environments && dashboard) {
    const currentDeployments: {
      [key: string]: OctopusPartialDeploymentType;
    } = {};

    environments.forEach((env) => {
      const item:
        | OctopusPartialDeploymentType
        | undefined = dashboard.Items.find(
        (item) => item.ProjectId === project.Id && item.EnvironmentId === env.Id
      );

      if (item) {
        currentDeployments[env.Name] = item;
      } else {
        console.warn('no deployments found for', env.Name);
      }
    });

    console.log(`Current deployments:`);
    console.log('');

    for (const envName in currentDeployments) {
      const deployment = await services.Octopus.fetchDeploymentById(
        currentDeployments[envName].Id
      );

      if (deployment) {
        console.log(
          `\t${kleur.green(envName)}:`,
          services.Octopus.getReleaseVersionById(deployment.ReleaseId),
          ' - ',
          kleur.blue().italic('deployed by '),
          kleur.magenta().italic(deployment.DeployedBy),
          kleur
            .blue()
            .italic(
              formatDistance(chrono.parseDate(deployment.Created), new Date(), {
                addSuffix: true,
              })
            )
        );
      }
    }
    console.log('');
  }

  if (environments) {
    const prompt = new AutoComplete({
      name: 'environments',
      message: `Deploy ${kleur.green(release.Version)} to:`,
      choices: environments.map((env) => env.Name),
    });

    const answer = await prompt.run().then((answer) => {
      console.log('Selected environment:', answer);
      return answer;
    });

    const env = environments.find((env) => env.Name == answer);

    console.log(env);
  }
}
