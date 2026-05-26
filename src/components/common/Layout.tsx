import { Outlet } from 'react-router-dom';
import { AuthInitializer } from './AuthInitializer';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <AuthInitializer />
      <Header />
      <main className="mx-auto max-w-7xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
