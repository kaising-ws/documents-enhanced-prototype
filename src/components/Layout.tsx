import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';

type AppView = 'team' | 'admin';

const STORAGE_VIEW = 'documents-fe.view';
const STORAGE_COLLAPSED = 'documents-fe.collapsed';

export function Layout() {
  const [view, setView] = useState<AppView>(() => {
    const v = localStorage.getItem(STORAGE_VIEW);
    return v === 'admin' ? 'admin' : 'team';
  });
  const [collapsed, setCollapsed] = useState<boolean>(
    () => localStorage.getItem(STORAGE_COLLAPSED) === '1',
  );

  useEffect(() => {
    localStorage.setItem(STORAGE_VIEW, view);
  }, [view]);

  useEffect(() => {
    localStorage.setItem(STORAGE_COLLAPSED, collapsed ? '1' : '0');
  }, [collapsed]);

  return (
    <div className="min-h-full">
      <Sidebar
        view={view}
        onViewChange={setView}
        collapsed={collapsed}
        onToggleCollapsed={() => setCollapsed((v) => !v)}
      />
      <div
        className={`min-h-screen flex flex-col transition-[padding] duration-200 ease-in-out ${
          collapsed ? 'pl-[68px]' : 'pl-[240px]'
        }`}
      >
        <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
