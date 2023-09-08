'use client';
import { useRouter } from 'next/navigation';

import { createAppSitePermissions } from '@/lib/GraphAPIClient';

interface AddAppPermissionProps {
  siteId: string;
}

export default function AddAppPermission({ siteId }: AddAppPermissionProps) {
  const router = useRouter();

  const handleAppSitePermissions = async () => {
    await createAppSitePermissions(siteId);
    router.refresh();
  }

  return (
    <form action={handleAppSitePermissions}>
      <button type="submit">Add App Permissions</button>
    </form>
  )
}