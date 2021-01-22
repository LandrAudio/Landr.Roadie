import {AxiosRequestConfig} from 'axios';
import {API, CredentialsType} from 'types';

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
      ReleaseNotes: null;
      BuildInformation: [];
      WorkItems: [];
      Commits: [];
    }
  ];
  ChangesMarkdown: string;
  EnvironmentId: string;
  TenantId: null;
  ForcePackageDownload: boolean;
  ForcePackageRedeployment: boolean;
  SkipActions: [];
  SpecificMachineIds: [];
  ExcludedMachineIds: [];
  ManifestVariableSetId: string;
  TaskId: string;
  ProjectId: string;
  UseGuidedFailure: boolean;
  Comments: null;
  FormValues: unknown;
  QueueTime: null;
  QueueTimeExpiry: null;
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
}
