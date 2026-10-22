
import { Outlet } from 'react-router-dom';

import Sidebar from './Sidebar';

export default function AdminLayout() {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-bg-app text-text-primary">
  <Sidebar />

  <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
    <main
      id="main-content"
      className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto"
    >
      <Outlet />
    </main>
  </div>
</div>
   
  );
}
