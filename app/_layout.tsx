import { Slot, useRouter, usePathname } from 'expo-router';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Spinner } from '../components/Spinner';
import { tokens } from '../theme/tokens';
import { StyleSheet, View } from 'react-native';

function Redirect({ to }: { to: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
  }, [to, router]);
  return null;
}

export default function RootLayout() {
  const pathname = usePathname();
  const [session, setSession] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: { session: sess } } = await supabase.auth.getSession();
      if (mounted) {
        setSession(sess);
        if (sess?.user) {
          const { data: prof } = await supabase
            .from('users')
            .select('nearest_rank_id, username')
            .eq('id', sess.user.id)
            .single();
          setProfile(prof);
        }
        setLoading(false);
      }
    };
    init();

    const sub = supabase.auth.onAuthStateChange((_event, sess) => {
      if (mounted) {
        setSession(sess);
        if (sess?.user) {
          supabase
            .from('users')
            .select('nearest_rank_id, username')
            .eq('id', sess.user.id)
            .single()
            .then(({ data }) => {
              if (mounted) setProfile(data);
            });
        }
      }
    });
    return () => {
      mounted = false;
      (sub as { data: { subscription: { unsubscribe: () => void } } }).data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: tokens.color.background }]}>
        <Spinner size="large" />
      </View>
    );
  }

  const isAuthRoute = pathname.startsWith('/(auth)');
  const isSetRankRoute = pathname === '/set-nearest-rank';
  const isPrivacyRoute = pathname === '/privacy-policy';

  if (!session) {
    if (isAuthRoute || isPrivacyRoute) return <Slot />;
    return <Redirect to="/(auth)/welcome" />;
  }

  if (!profile?.nearest_rank_id || !profile?.username) {
    if (isSetRankRoute) return <Slot />;
    return <Redirect to="/set-nearest-rank" />;
  }

  if (isAuthRoute) return <Redirect to="/(tabs)/index" />;
  return <Slot />;
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
