import { AppLayout } from '@/components/AppLayout';

export default function SupervisorLayout({ children }) {
  return <AppLayout navItems="supervisor" role="Supervisor">{children}</AppLayout>;
}
