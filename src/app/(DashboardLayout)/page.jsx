'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/spa/dashboard');
  }, [router]);

  return null;
}
