import { listSites } from '@/lib/GraphAPIClient';
import SitePermissions from './SitePermissions';
import { Suspense } from 'react';
import AddPermission from './Permissions/AddAppPermission';
export default async function SitesList() {
  const sites = await listSites();

  if (!sites) {
    return <div>Loading...</div>
  }

  if (sites.length === 0) {
    return <div>No sites found</div>
  }

  return (
    <>
      {sites.map(site => (
        <div key={site.id} className='text-current'>
          <h2><a href={site.webUrl}>{site.name} <span className='text-sm italic'>({site.webUrl})</span></a></h2>
          <div className='ml-4'><Suspense fallback={<span>loading...</span>}><SitePermissions siteId={site.id} /></Suspense></div>
        </div>
      ))
      }
    </>
  )
}