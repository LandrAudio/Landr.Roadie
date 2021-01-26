import {
  OctopusPartialDeploymentType,
  OctopusProjectType,
  OctopusReleaseType,
} from 'apis/OctopusApi';
import {formatDistance} from 'date-fns';
import clear from 'clear';
import * as chrono from 'chrono-node';
import kleur from 'kleur';
import {Spinner} from 'clui';
import notifier from 'node-notifier';
import cliCursor from 'cli-cursor';
import {InitializedApisType} from 'types';
import postDemploymentMenu from './postDeploymentMenu';
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

    console.log(
      kleur.bold().blue(`Current deployments for ${kleur.red(project.Name)}:`)
    );
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
          kleur.blue().italic(
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

    const answer = await prompt.run().then((answer: string) => answer);

    const env = environments.find((env) => env.Name == answer);

    if (env) {
      clear();

      console.log(
        kleur
          .bold()
          .blue(
            `Deploying ${kleur.red(project.Name)} build ${kleur.green(
              release.Version
            )} to ${kleur.magenta(env.Name)}`
          )
      );

      const task = await services.Octopus.deployRelease(release.Id, env.Id);

      if (task) {
        const spinner = new Spinner(`${task.Completed}...`, [
          '▹▹▹▹▹',
          '▸▹▹▹▹',
          '▹▸▹▹▹',
          '▹▹▸▹▹',
          '▹▹▹▸▹',
          '▹▹▹▹▸',
        ]);

        cliCursor.hide();

        spinner.start();

        const refreshStatus = async (taskId: string) => {
          const task = await services.Octopus.fetchTask(taskId);

          if (!task) {
            await new Promise((resolve) => setTimeout(resolve, 1000));

            await refreshStatus(taskId);

            return;
          }

          if (!task.IsCompleted) {
            spinner.message(
              `${task.Completed} ${kleur.blue(
                `(${task.Duration})`
              )}             ` // padding so we don't get character overlap
            );

            await new Promise((resolve) => setTimeout(resolve, 1000));

            await refreshStatus(taskId);

            return;
          }

          spinner.stop();

          console.log(
            kleur.italic().magenta(`Deployement finshed after ${task.Duration}`)
          );

          notifier.notify({
            title: `"${project.Name}" Deployment Success`,
            message: `${release.Version} to ${env.Name} completed  after ${task.Duration}`,
          });
        };

        await refreshStatus(task.Id);

        cliCursor.show();

        return postDemploymentMenu(services);
      }
    }
  }
}
