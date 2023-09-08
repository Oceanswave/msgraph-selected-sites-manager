export interface Site {
  id: string;
  name: string;
  webUrl: string;
  displayName: string;
  description: string;
  siteCollection: {
    hostname: string;
  };
}

export interface SitePermission {
  id: string;
  grantedToIdentitiesV2: Identity[];
}

export interface Identity {
  application: {
    id: string;
    displayName: string;
  };
}