'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { Cable } from 'lucide-react';
import { adminNavItems, supervisorNavItems, officerNavItems } from '@/lib/nav-items';

const navItemsMap = {
  admin: adminNavItems,
  supervisor: supervisorNavItems,
  officer: officerNavItems,
};

export function AppLayout({ navItems: navItemsKey, children, role }) {
  const pathname = usePathname();
  const navItems = navItemsMap[navItemsKey] || [];

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-sidebar-foreground hover:text-sidebar-foreground/80">
            <Cable className="w-8 h-8" />
            <span className="group-data-[collapsible=icon]:hidden">Indian Railways</span>
          </Link>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <Link href={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={{children: item.title}}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <Header role={role} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-white">
            {children}
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
