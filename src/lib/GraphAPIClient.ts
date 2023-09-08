'use server';

import * as msal from '@azure/msal-node';
import { Site, SitePermission } from './GraphModels';

export async function getAdminToken(tokenRequest: msal.ClientCredentialRequest) {
  const msalConfig: msal.Configuration = {
    auth: {
      clientId: process.env.SELECTED_SITES_MANAGER_ADMIN_CLIENT_ID || '',
      authority: process.env.SELECTED_SITES_MANAGER_AAD_ENDPOINT + '/' + process.env.SELECTED_SITES_MANAGER_TENANT_ID,
      clientSecret: process.env.SELECTED_SITES_MANAGER_ADMIN_CLIENT_SECRET,
    },
  };

  const cca = new msal.ConfidentialClientApplication(msalConfig);

  return await cca.acquireTokenByClientCredential(tokenRequest);
}

export async function getAdminAccessToken() {
  let graphAuth: any = {};

  const graphTokenRequest: msal.ClientCredentialRequest = {
    scopes: [`${process.env.SELECTED_SITES_MANAGER_GRAPH_ENDPOINT}/.default`],
  };

  const graphAuthResponse = await getAdminToken(graphTokenRequest);

  if (graphAuthResponse === null) {
    // could not get access token
    throw new Error('Could not get admin access token');
  }

  return graphAuthResponse;
}
// ------------------------------------------------------------
// Get an access token for the Microsoft Graph API and retrieve sites
// ------------------------------------------------------------
export async function listSites() {
  let sites: Site[] = [];
  const graphAuth = await getAdminAccessToken();

  // call the Graph API with the access token
  const siteResponse = await fetch(
    `${process.env.SELECTED_SITES_MANAGER_GRAPH_ENDPOINT}/v1.0/sites?$select=siteCollection,webUrl,name,displayName,description,id`,
    {
      headers: {
        Authorization: `Bearer ${graphAuth.accessToken}`,
      },
    },
  );

  if (siteResponse === null || !siteResponse.ok) {
    throw new Error('Could not list sites');
  }

  let site = await siteResponse.json();
  sites.push(...site.value);

  // repeat until all sites are retrieved
  while (site['@odata.nextLink']) {
    const nextSiteResponse = await fetch(site['@odata.nextLink'], {
      headers: {
        Authorization: `Bearer ${graphAuth.accessToken}`,
      },
    });

    if (nextSiteResponse === null || !nextSiteResponse.ok) {
      throw new Error('Could not list sites');
    }

    site = await nextSiteResponse.json();
    sites.push(...site.value);
  }

  return sites;
}

export async function listSitePermissions(siteId: string) {
  const allSitePermissions: SitePermission[] = [];
  const graphAuth = await getAdminAccessToken();

  const permissionsResponse = await fetch(
    `${process.env.SELECTED_SITES_MANAGER_GRAPH_ENDPOINT}/v1.0/sites/${siteId}/permissions`,
    {
      headers: {
        Authorization: `Bearer ${graphAuth.accessToken}`,
      },
    },
  );

  if (permissionsResponse === null || !permissionsResponse.ok) {
    throw new Error('Could not list site permissions');
  }

  let permissions = await permissionsResponse.json();
  allSitePermissions.push(...permissions.value);

  // repeat until all site permissions are retrieved
  while (permissions['@odata.nextLink']) {
    const nextPermissionsResponse = await fetch(permissions['@odata.nextLink'], {
      headers: {
        Authorization: `Bearer ${graphAuth.accessToken}`,
      },
    });

    if (nextPermissionsResponse === null || !nextPermissionsResponse.ok) {
      throw new Error('Could not list permissions');
    }

    permissions = await nextPermissionsResponse.json();
    allSitePermissions.push(...permissions.value);
  }

  return allSitePermissions;
}

export async function createAppSitePermissions(siteId: string) {
  const graphAuth = await getAdminAccessToken();

  const createSitePermissionsResponse = await fetch(
    `${process.env.SELECTED_SITES_MANAGER_GRAPH_ENDPOINT}/v1.0/sites/${siteId}/permissions`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${graphAuth.accessToken}`,
        'Content-Type': 'application/json',
      },
      body : JSON.stringify({
        "roles": ["read","write", "readwrite"],
        "grantedToIdentities": [{
          "application": {
            "id": process.env.SELECTED_SITES_MANAGER_APP_CLIENT_ID,
            "displayName": process.env.SELECTED_SITES_MANAGER_APP_NAME,
          }
        }]
      })
    },
  );

  if (createSitePermissionsResponse === null || !createSitePermissionsResponse.ok) {
    throw new Error(`Could not create site permissions: ${createSitePermissionsResponse.statusText}`);
  }

  const createSitePermissions: SitePermission = await createSitePermissionsResponse.json();
  return createSitePermissions;
}

export async function deleteAppSitePermissions(siteId: string, permissionId: string) {
  const graphAuth = await getAdminAccessToken();

  const deleteSitePermissionsResponse = await fetch(
    `${process.env.SELECTED_SITES_MANAGER_GRAPH_ENDPOINT}/v1.0/sites/${siteId}/permissions/${permissionId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${graphAuth.accessToken}`,
      },
    },
  );

  if (deleteSitePermissionsResponse === null || !deleteSitePermissionsResponse.ok) {
    throw new Error(`Could not delete site permissions: ${deleteSitePermissionsResponse.statusText}`);
  }

  return true;
}