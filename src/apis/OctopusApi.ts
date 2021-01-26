import {AxiosRequestConfig} from 'axios';
import { CredentialsType} from 'types';
import API from './Api';

export type OctopusProjectType = {
  Name: string;
  Id: string;
  Links: OctopusLinkObject;
};

export type OctopusReleasePayloadType = {
  Items: OctopusReleaseType[];
};

export type OctopusReleaseType = {
  Id: string;
  Version: string;
};

export type OctopusEnvironmentType = {
  Id: string;
  Name: string;
};

export type OctopusLinkObject = {
  [k: string]: string;
};

export type OctopusPartialDeploymentType = {
  Id: string;
  ProjectId: string;
  EnvironmentId: string;
  ReleaseId: string;
  DeploymentId: string;
  TaskId: string;
  TenantId: string | null;
  ChannelId: string;
  ReleaseVersion: string;
  Created: string;
  QueueTime: string;
  StartTime: string;
  CompletedTime: string;
  State: string;
  HasPendingInterruptions: boolean;
  HasWarningsOrErrors: boolean;
  ErrorMessage: string;
  Duration: string;
  IsCurrent: boolean;
  IsPrevious: boolean;
  IsCompleted: boolean;
  Links: OctopusLinkObject;
};

export type OctopusFullDeploymentType = {
  Id: string;
  ReleaseId: string;
  ChannelId: string;
  DeploymentProcessId: string;
  Changes: [
    {
      Version: string;
      ReleaseNotes: string | null;
      BuildInformation: [];
      WorkItems: [];
      Commits: [];
    }
  ];
  ChangesMarkdown: string;
  EnvironmentId: string;
  TenantId: string | null;
  ForcePackageDownload: boolean;
  ForcePackageRedeployment: boolean;
  SkipActions: [];
  SpecificMachineIds: [];
  ExcludedMachineIds: [];
  ManifestVariableSetId: string;
  TaskId: string;
  ProjectId: string;
  UseGuidedFailure: boolean;
  Comments: string | null;
  FormValues: unknown;
  QueueTime: string | null;
  QueueTimeExpiry: string | null;
  Name: string;
  Created: string;
  SpaceId: string;
  TentacleRetentionPeriod: {
    Unit: string;
    QuantityToKeep: number;
    ShouldKeepForever: boolean;
  };
  DeployedBy: string;
  DeployedById: string;
  FailureEncountered: boolean;
  DeployedToMachineIds: [string, string];
  Links: {
    Self: string;
    Release: string;
    Environment: string;
    Project: string;
    Task: string;
    Web: string;
    Artifacts: string;
    Interruptions: string;
    DeploymentProcess: string;
    Variables: string;
  };
};

type OctopusTaskType = {
  Id: string,
  SpaceId: string,
  Name: string,
  Description: string,
  Arguments: { DeploymentId: string },
  State: string,
  Completed: string,
  QueueTime: string,
  QueueTimeExpiry: string | null,
  StartTime: string,
  LastUpdatedTime: string,
  CompletedTime: string | null,
  ServerNode: string,
  Duration: string,
  ErrorMessage: string,
  HasBeenPickedUpByProcessor: boolean,
  IsCompleted: boolean,
  FinishedSuccessfully: boolean,
  HasPendingInterruptions: boolean,
  CanRerun: boolean,
  HasWarningsOrErrors: boolean,
  Links: {
    Self: string,
    Web: string,
    Raw: string,
    Rerun: string,
    Cancel: string,
    State: string,
    QueuedBehind: string,
    Details: string,
    Artifacts: string,
    Interruptions:string,
  }
}

type OctopusDashboardType = {
  Projects: OctopusProjectType[];
  Items: OctopusPartialDeploymentType[];
};

export default class OctopusAPI extends API {
  baseUrl = 'https://octopus.landr.com/';
  static keyPage = 'https://octopus.landr.com/app#/users/me/apiKeys';
  public static keyOnlyAuthentication = true;
  releases: OctopusReleaseType[] = [];

  get baseRequestConfig(): AxiosRequestConfig {
    return {
      baseURL: this.baseUrl,
      headers: {
        'X-Octopus-ApiKey': this.credentials.apiKey,
      },
    };
  }

  testCredentials(): Promise<unknown> {
    return this.request('/api/users/me', 'get', {
      headers: {
        'X-Octopus-ApiKey': this.credentials.apiKey,
      },
    });
  }

  constructor(credentials: CredentialsType) {
    super(credentials);
  }

  async fetchProjects(): Promise<OctopusProjectType[] | undefined> {
    return this.request<OctopusProjectType[]>('/api/projects/all');
  }

  async fetchReleasesForProject(
    id: string
  ): Promise<OctopusReleasePayloadType | undefined> {
    const payload = await this.request<OctopusReleasePayloadType>(
      `/api/projects/${id}/releases`
    );

    if (payload?.Items) {
      this.releases = payload.Items;
    }

    return payload;
  }

  async fetchEnvironments(): Promise<OctopusEnvironmentType[] | undefined> {
    return this.request<OctopusEnvironmentType[]>('/api/environments/all');
  }

  async fetchEnvironmentById(
    id: string
  ): Promise<OctopusEnvironmentType | undefined> {
    return this.request<OctopusEnvironmentType>(`/api/environments/${id}`);
  }

  async fetchDashboard(): Promise<OctopusDashboardType | undefined> {
    return this.request<OctopusDashboardType>(`/api/dashboard/dynamic`);
  }

  async fetchDeploymentById(
    id: string
  ): Promise<OctopusFullDeploymentType | undefined> {
    return this.request<OctopusFullDeploymentType>(`/api/deployments/${id}`);
  }

  getReleaseVersionById(releaseId: string): string | undefined {
    const release = this.releases.find((release) => release.Id === releaseId);
    return release?.Version;
  }

  async deployRelease(
    releaseId: string,
    envId: string
  ): Promise<OctopusTaskType | undefined> {
    const release = await this.request<OctopusFullDeploymentType>(
      `/api/deployments`,
      'post',
      {
        EnvironmentId: envId,
        ReleaseId: releaseId,
      }
    );

    if (!release) {
      return undefined;
    }

    return this.fetchTask(release.TaskId);
  }

  async fetchTask(
    taskId: string,
  ): Promise<OctopusTaskType | undefined> {
    return this.request<OctopusTaskType>(`/api/tasks/${taskId}`);
  }
}
