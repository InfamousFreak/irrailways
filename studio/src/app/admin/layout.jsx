import { AppLayout } from '@/components/AppLayout';

export default function AdminLayout({ children }) {
  return <AppLayout navItems="admin" role="Admin">{children}</AppLayout>;
}
