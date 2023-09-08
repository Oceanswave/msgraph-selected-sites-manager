'use client';

import { deleteAppSitePermissions } from '@/lib/GraphAPIClient';
import { useRouter } from 'next/navigation';

interface DeleteAppPermissionProps {
  siteId: string;
  permissionId: string;
}

export default function DeleteAppPermission({ siteId, permissionId }: DeleteAppPermissionProps) {
  const router = useRouter();

  const handleAppSitePermissions = async () => {
    await deleteAppSitePermissions(siteId, permissionId);
    router.refresh();
  }

  return (
    <form action={handleAppSitePermissions}>
      <button type="submit">Delete App Permissions</button>
    </form>
  )
}