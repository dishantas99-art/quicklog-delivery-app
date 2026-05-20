import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '@/lib/auth-context';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.role === 'staff') {
      router.replace('/staff-home');
    } else if (user?.role === 'admin') {
      router.replace('/admin-dashboard');
    }
  }, [user, router]);

  return null;
}
