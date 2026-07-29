import { createClient, type User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

const ACCESS_TOKEN_COOKIE = 'sb_access_token';
const REFRESH_TOKEN_COOKIE = 'sb_refresh_token';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const AUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
  path: '/',
};

export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (!accessToken) return null;

  const authClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await authClient.auth.getUser(accessToken);
  if (!error) return data.user;
  if (!refreshToken) return null;

  const { data: refreshed, error: refreshError } =
    await authClient.auth.refreshSession({
      refresh_token: refreshToken,
    });
  if (refreshError || !refreshed.user || !refreshed.session) return null;

  try {
    setAuthCookies(
      cookieStore,
      refreshed.session.access_token,
      refreshed.session.refresh_token,
    );
  } catch {
    // Server Components cannot always mutate cookies. The verified user can
    // still finish this request; a Route Handler/Action will persist refresh.
  }
  return refreshed.user;
}

export async function getAuthenticatedProfile() {
  const user = await getAuthenticatedUser();
  if (!user?.email) return null;

  const dataClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${(await cookies()).get(ACCESS_TOKEN_COOKIE)?.value}`,
      },
    },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profileById } = await dataClient
    .from('profiles')
    .select('email, role, status')
    .eq('auth_user_id', user.id)
    .eq('status', 'approved')
    .maybeSingle();
  const fallbackResult = profileById
    ? { data: profileById, error: null }
    : await dataClient
        .from('profiles')
        .select('email, role, status')
        .eq('email', user.email)
        .eq('status', 'approved')
        .maybeSingle();
  const { data: profile, error } = fallbackResult;

  if (error || !profile) return null;
  return profile as { email: string; role: 'admin' | 'user'; status: 'approved' };
}

export function setAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
  accessToken: string,
  refreshToken: string,
) {
  cookieStore.set(ACCESS_TOKEN_COOKIE, accessToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 60 * 60,
  });
  cookieStore.set(REFRESH_TOKEN_COOKIE, refreshToken, {
    ...AUTH_COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearAuthCookies(
  cookieStore: Awaited<ReturnType<typeof cookies>>,
) {
  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  cookieStore.delete('session');
  cookieStore.delete('user_email');
}

export async function createAuthenticatedClient() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  if (!accessToken) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
