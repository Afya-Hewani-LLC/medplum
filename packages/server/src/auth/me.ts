import { getReferenceString, Operator, ProfileResource, WithId } from '@medplum/core';
import { Login, Project, ProjectMembership, Reference, User, UserConfiguration } from '@medplum/fhirtypes';
import Bowser from 'bowser';
import { Request, Response } from 'express';
import { getAuthenticatedContext } from '../context';
import { getAccessPolicyForLogin } from '../fhir/accesspolicy';
import { getSystemRepo, Repository } from '../fhir/repo';
import { rewriteAttachments, RewriteMode } from '../fhir/rewrite';

interface UserSession {
  id: string;
  lastUpdated: string;
  authMethod: string;
  remoteAddress: string;
  browser?: string;
  os?: string;
}

interface UserSecurity {
  mfaEnrolled: boolean;
  sessions: UserSession[];
}

export async function meHandler(req: Request, res: Response): Promise<void> {
  const systemRepo = getSystemRepo();
  const { authState } = getAuthenticatedContext();
  const { project, membership } = authState;
  const profileRef = membership.profile as Reference<ProfileResource>;
  const profile = await systemRepo.readReference<ProfileResource>(profileRef);
  const config = await getUserConfiguration(systemRepo, project, membership);
  const accessPolicy = await getAccessPolicyForLogin(authState);
  let user: WithId<User> | undefined = undefined;

  let security: UserSecurity | undefined = undefined;
  if (membership.user?.reference?.startsWith('User/')) {
    user = await systemRepo.readReference<User>(membership.user as Reference<User>);
    const sessions = await getSessions(systemRepo, user);
    security = {
      mfaEnrolled: !!user.mfaEnrolled,
      sessions,
    };
  }

  const result = {
    user: user
      ? {
          resourceType: 'User',
          id: user.id,
          email: user.email,
          identifier: user.identifier,
        }
      : undefined,
    project: {
      resourceType: 'Project',
      id: project.id,
      name: project.name,
      description: project.description,
      strictMode: project.strictMode,
      superAdmin: project.superAdmin,
    },
    membership: {
      resourceType: 'ProjectMembership',
      id: membership.id,
      identifier: membership.identifier,
      user: membership.user,
      profile: membership.profile,
      admin: membership.admin,
    },
    profile,
    config,
    accessPolicy,
    security,
  };

  res.status(200).json(await rewriteAttachments(RewriteMode.PRESIGNED_URL, systemRepo, result));
}

export async function getUserConfiguration(
  systemRepo: Repository,
  project: Project,
  membership: ProjectMembership
): Promise<UserConfiguration> {
  if (membership.userConfiguration) {
    return systemRepo.readReference<UserConfiguration>(membership.userConfiguration);
  }

  const favorites = ['Patient', 'Practitioner', 'Organization', 'ServiceRequest', 'DiagnosticReport', 'Questionnaire'];

  const result = {
    resourceType: 'UserConfiguration',
    menu: [
      {
        title: 'Favorites',
        link: favorites.map((resourceType) => ({ name: resourceType, target: '/' + resourceType })),
      },
    ],
  } satisfies UserConfiguration;

  if (membership.admin) {
    result.menu.push({
      title: 'Admin',
      link: [
        { name: 'Project', target: '/admin/project' },
        { name: 'AccessPolicy', target: '/AccessPolicy' },
        { name: 'Subscriptions', target: '/Subscription' },
        { name: 'Batch', target: '/batch' },
        ...(!project.superAdmin ? [{ name: 'Config', target: '/admin/config' }] : []),
      ],
    });
  }

  if (project.superAdmin) {
    result.menu.push({
      title: 'Super Admin',
      link: [
        { name: 'Projects', target: '/Project' },
        { name: 'Super Config', target: '/admin/super' },
      ],
    });
  }

  return result;
}

async function getSessions(systemRepo: Repository, user: WithId<User>): Promise<UserSession[]> {
  const logins = await systemRepo.searchResources<Login>({
    resourceType: 'Login',
    filters: [
      {
        code: 'user',
        operator: Operator.EQUALS,
        value: getReferenceString(user),
      },
      {
        code: '_lastUpdated',
        operator: Operator.GREATER_THAN,
        value: new Date(Date.now() - 3600 * 1000).toISOString(),
      },
    ],
  });

  const result = [];
  for (const login of logins) {
    if (!login.membership || login.revoked) {
      continue;
    }

    // Previously used ua-parser, but ultimately replaced due to incompatible licence
    const browser = login.userAgent ? Bowser.getParser(login.userAgent) : undefined;

    result.push({
      id: login.id,
      lastUpdated: login.meta?.lastUpdated as string,
      authMethod: login.authMethod as string,
      remoteAddress: login.remoteAddress as string,
      browser: browser?.getBrowser()?.name,
      os: browser?.getOS()?.name,
    });
  }
  return result;
}
