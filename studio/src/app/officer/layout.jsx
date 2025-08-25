import { AppLayout } from '@/components/AppLayout';

export default function OfficerLayout({ children }) {
  return <AppLayout navItems="officer" role="Officer">{children}</AppLayout>;
}
