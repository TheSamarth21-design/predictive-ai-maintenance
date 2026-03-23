import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from '@/components/syncplant/AppSidebar';
import { generateAlerts } from '@/lib/syncplant-data';

export default function SyncPlantLayout() {
  const unreadAlerts = generateAlerts().filter(a => !a.read).length;

  return (
    <div className="min-h-screen flex w-full bg-background">
      <AppSidebar alertCount={unreadAlerts} />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
