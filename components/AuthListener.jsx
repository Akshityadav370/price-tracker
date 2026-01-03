'use client';

import { useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function AuthListener() {
  const supabase = createClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event !== 'SIGNED_IN' || !session?.user) return;

      const user = session.user;

      const isNewUser =
        Math.abs(new Date(user.created_at) - new Date(user.last_sign_in_at)) <
        2000;

      if (!isNewUser) return;

      await fetch('/api/auth/login-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user.email,
        }),
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
