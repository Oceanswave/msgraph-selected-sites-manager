import { listSitePermissions } from '@/lib/GraphAPIClient';
import AddAppPermission from './Permissions/AddAppPermission';
import RemoveAppPermission from './Permissions/RemoveAppPermission';
import { SitePermission } from '@/lib/GraphModels';
interface SitePermissionsProps {
  siteId: string;
}

export default async function SitePermissions({ siteId }: SitePermissionsProps) {
  const sitePermissions = await listSitePermissions(siteId);

  let appPermission: SitePermission | undefined;
  // If any of the identities matches the app id, then we have app permissions
  sitePermissions.forEach(sitePermission => {
    sitePermission.grantedToIdentitiesV2.forEach(identity => {
      if (identity.application.id === process.env.SELECTED_SITES_MANAGER_APP_CLIENT_ID) {
        appPermission = sitePermission;
      }
    })
  })

  return (
    <>
      {!sitePermissions || sitePermissions.length === 0 && <div>No permissions</div>}
      {sitePermissions.map(sitePermissions => (
          <div key={sitePermissions.id} className='text-current'>
            {sitePermissions.grantedToIdentitiesV2.map(identity => (
              <h2 key={identity.application.id}>{identity.application.displayName}</h2>
            ))}
          </div>
        ))
      }
      <div>
        {appPermission ? <RemoveAppPermission siteId={siteId} permissionId={appPermission.id}/> : <AddAppPermission siteId={siteId} />}
      </div>
    </>
  )
}