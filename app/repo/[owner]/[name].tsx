import * as WebBrowser from 'expo-web-browser';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OpenHtmlButton } from '@/components/OpenHtmlButton';
import { EmptyState, ErrorState, LoadingState } from '@/components/StateViews';
import { useAuth } from '@/lib/auth';
import { fetchReadme, fetchRepo } from '@/lib/github';
import { formatDate, formatNumber } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';
import type { GitHubRepo } from '@/lib/types';

export default function RepoDetailScreen() {
  const { owner, name } = useLocalSearchParams<{ owner: string; name: string }>();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  const c = useThemeColors();

  const [repo, setRepo] = useState<GitHubRepo | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!token || !owner || !name) return;
    setLoading(true);
    setError(null);
    try {
      const [repoData, readmeData] = await Promise.all([
        fetchRepo(token, owner, name),
        fetchReadme(token, owner, name).catch(() => null),
      ]);
      setRepo(repoData);
      setReadme(readmeData);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Nie udało się pobrać szczegółów.');
    } finally {
      setLoading(false);
    }
  }, [token, owner, name]);

  useEffect(() => {
    if (isAuthenticated && token) load();
  }, [isAuthenticated, token, load]);

  if (authLoading) return <LoadingState />;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: c.background }]} edges={['bottom']}>
      <Stack.Screen options={{ title: name ?? 'Repozytorium' }} />

      {loading ? (
        <LoadingState message="Ładowanie szczegółów…" />
      ) : error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !repo ? (
        <EmptyState title="Brak danych" />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={[styles.title, { color: c.text }]}>{repo.full_name}</Text>
          <View style={styles.row}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: repo.private ? c.warning + '33' : c.success + '33',
                },
              ]}
            >
              <Text
                style={{
                  color: repo.private ? c.warning : c.success,
                  fontWeight: '700',
                  fontSize: 12,
                }}
              >
                {repo.private ? 'Prywatne' : 'Publiczne'}
              </Text>
            </View>
            {repo.language ? (
              <Text style={[styles.lang, { color: c.textSecondary }]}>{repo.language}</Text>
            ) : null}
          </View>

          <Text style={[styles.desc, { color: c.textSecondary }]}>
            {repo.description ?? 'Brak opisu'}
          </Text>

          {repo.topics?.length ? (
            <View style={styles.topics}>
              {repo.topics.map((t) => (
                <View
                  key={t}
                  style={[styles.topic, { backgroundColor: c.tintSoft }]}
                >
                  <Text style={{ color: c.tint, fontWeight: '600', fontSize: 12 }}>{t}</Text>
                </View>
              ))}
            </View>
          ) : null}

          <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
            <InfoRow label="Domyślna gałąź" value={repo.default_branch} />
            <InfoRow label="Ostatni push" value={formatDate(repo.pushed_at)} />
            <InfoRow label="Aktualizacja" value={formatDate(repo.updated_at)} />
            <InfoRow
              label="Otwarte issues"
              value={formatNumber(repo.open_issues_count)}
            />
            <InfoRow
              label="Gwiazdki / forki"
              value={`${formatNumber(repo.stargazers_count)} / ${formatNumber(repo.forks_count)}`}
            />
            <InfoRow
              label="Licencja"
              value={repo.license?.spdx_id || repo.license?.name || 'Brak'}
            />
          </View>

          {token ? <OpenHtmlButton token={token} repo={repo} variant="primary" /> : null}

          <Pressable
            onPress={() => WebBrowser.openBrowserAsync(repo.html_url)}
            style={[styles.buttonSecondary, { borderColor: c.border, backgroundColor: c.card }]}
          >
            <Text style={[styles.buttonSecondaryText, { color: c.text }]}>
              Otwórz na GitHub
            </Text>
          </Pressable>

          <Text style={[styles.section, { color: c.text }]}>README</Text>
          <View style={[styles.readme, { backgroundColor: c.card, borderColor: c.border }]}>
            {readme ? (
              <Text style={[styles.readmeText, { color: c.text }]} selectable>
                {readme}
              </Text>
            ) : (
              <Text style={{ color: c.textSecondary, fontStyle: 'italic' }}>
                Brak pliku README w tym repozytorium.
              </Text>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  const c = useThemeColors();
  return (
    <View style={styles.infoRow}>
      <Text style={[styles.infoLabel, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  lang: { fontSize: 13, fontWeight: '600' },
  desc: { fontSize: 15, lineHeight: 22 },
  topics: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  topic: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  card: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 10 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  infoLabel: { fontSize: 13, flexShrink: 0 },
  infoValue: { fontSize: 13, fontWeight: '600', textAlign: 'right', flex: 1 },
  buttonSecondary: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonSecondaryText: { fontWeight: '700', fontSize: 16 },
  section: { fontSize: 18, fontWeight: '800', marginTop: 8 },
  readme: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  readmeText: {
    fontFamily: 'SpaceMono',
    fontSize: 12,
    lineHeight: 18,
  },
});
