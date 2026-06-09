import { redirect } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import Dashboard from './dashboard';

export const dynamic = 'force-dynamic';

export default function Home() {
  if (!isAuthenticated()) redirect('/login');
  return <Dashboard />;
}
