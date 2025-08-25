'use client';
import { useSelectedLayoutSegment } from 'next/navigation';
import { UserNav } from './UserNav';
import { SidebarTrigger } from './ui/sidebar';

function toTitleCase(str) {
  if (!str) return '';
  return str.replace(/-/g, ' ').replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

export function Header({ role }) {
  const segment = useSelectedLayoutSegment();
  const title = segment ? toTitleCase(segment) : 'Dashboard';

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
       <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="ml-auto flex items-center gap-4">
        <UserNav role={role} />
      </div>
    </header>
  );
}
