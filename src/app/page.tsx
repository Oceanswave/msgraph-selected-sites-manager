import { Suspense } from 'react';
import SitesList from './SitesList';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-24">
      <Suspense fallback={<div>Loading...</div>}>
        <SitesList />
      </Suspense>
    </main>
  )
}
