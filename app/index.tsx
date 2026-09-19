import { Redirect, Stack, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RepoCard } from '@/components/RepoCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { useAuth } from '@/lib/auth';
import { fetchAllUserRepos } from '@/lib/github';
import { useThemeColors } from '@/lib/theme';
import type { GitHubRepo, SortOption, VisibilityFilter } from '@/lib/types';

const VISIBILITY_OPTIONS: { key: VisibilityFilter; label: string }[] = [
  { key: 'all', label: 'Wszystkie' },
  { key: 'public', label: 'Publiczne' },
  { key: 'private', label: 'Prywatne' },
];

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'updated', label: 'Aktualizacja' },
  { key: 'stars', label: 'Gwiazdki' },
  { key: 'name', label: 'Nazwa' },
];

export default function HomeScreen() {
  const { token, user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const c = useThemeColors();
  const router = useRouter();

  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [visibility, setVisibility] = useState<VisibilityFilter>('all');
  const [sort, setSort] = useState<SortOption>('updated');

  const load = useCallback(
    async (mode: 'initial' | 'refresh' = 'initial') => {
      if (!token) return;
      if (mode === 'refresh') setRefreshing(true);
      else setLoading(true);
      setError(null);
      try {
        const data = await fetchAllUserRepos(token);
        setRepos(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Nie udało się pobrać repozytoriów.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (isAuthenticated && token) {
      load('initial');
    }
  }, [isAuthenticated, token, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = repos.filter((r) => {
      if (visibility === 'public' && r.private) return false;
      if (visibility === 'private' && !r.private) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.description?.toLowerCase().includes(q) ?? false) ||
        r.full_name.toLowerCase().includes(q)
      );
    });

    list = [...list].sort((a, b) => {
      if (sort === 'stars') return b.stargazers_count - a.stargazers_count;
      if (sort === 'name') return a.name.localeCompare(b.name, 'pl');
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });

    return list;
  }, [repos, query, visibility, sort]);

  if (authLoading) {
    return <LoadingState message="Sprawdzanie sesji…" />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['bottom']}>
      <Stack.Screen
        options={{
          title: 'GitHub Projekty',
          headerRight: () => (
            <Pressable onPress={() => logout()} hitSlop={12}>
              <Text style={{ color: c.tint, fontWeight: '700' }}>Wyloguj</Text>
            </Pressable>
          ),
        }}
      />

      <View style={styles.header}>
        <Text style={[styles.greeting, { color: c.textSecondary }]}>
          Zalogowano jako{' '}
          <Text style={{ color: c.text, fontWeight: '700' }}>{user?.login}</Text>
        </Text>

        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Szukaj po nazwie…"
          placeholderTextColor={c.textSecondary}
          autoCapitalize="none"
          autoCorrect={false}
          style={[
            styles.search,
            { backgroundColor: c.input, borderColor: c.border, color: c.text },
          ]}
        />

        <Text style={[styles.filterLabel, { color: c.textSecondary }]}>Widoczność</Text>
        <View style={styles.chips}>
          {VISIBILITY_OPTIONS.map((opt) => {
            const active = visibility === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setVisibility(opt.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? c.tint : c.chip,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? '#fff' : c.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.filterLabel, { color: c.textSecondary }]}>Sortowanie</Text>
        <View style={styles.chips}>
          {SORT_OPTIONS.map((opt) => {
            const active = sort === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setSort(opt.key)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? c.tint : c.chip,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: active ? '#fff' : c.text },
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.count, { color: c.textSecondary }]}>
          Pokazano {filtered.length} z {repos.length}
        </Text>
      </View>

      {loading ? (
        <LoadingState message="Pobieranie repozytoriów…" />
      ) : error ? (
        <ErrorState message={error} onRetry={() => load('initial')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => load('refresh')}
              tintColor={c.tint}
            />
          }
          ListEmptyComponent={
            <EmptyState
              title="Brak repozytoriów"
              subtitle={
                query || visibility !== 'all'
                  ? 'Zmień wyszukiwanie lub filtry.'
                  : 'Na tym koncie nie ma jeszcze żadnych repozytoriów.'
              }
            />
          }
          renderItem={({ item }) => (
            <RepoCard
              repo={item}
              token={token!}
              onPress={() =>
                router.push({
                  pathname: '/repo/[owner]/[name]',
                  params: { owner: item.owner.login, name: item.name },
                })
              }
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 8, gap: 8 },
  greeting: { fontSize: 13 },
  search: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  filterLabel: { fontSize: 12, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  chipText: { fontSize: 13, fontWeight: '700' },
  count: { fontSize: 12, marginBottom: 4 },
  list: { padding: 16, paddingTop: 8, flexGrow: 1 },
});
