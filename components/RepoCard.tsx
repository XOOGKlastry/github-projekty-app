import { Pressable, StyleSheet, Text, View } from 'react-native';

import { formatDate, formatNumber } from '@/lib/format';
import { useThemeColors } from '@/lib/theme';
import type { GitHubRepo } from '@/lib/types';

type Props = {
  repo: GitHubRepo;
  onPress: () => void;
};

export function RepoCard({ repo, onPress }: Props) {
  const c = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: c.card,
          borderColor: c.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={styles.header}>
        <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
          {repo.name}
        </Text>
        <View
          style={[
            styles.badge,
            {
              backgroundColor: repo.private ? c.warning + '33' : c.success + '33',
            },
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              { color: repo.private ? c.warning : c.success },
            ]}
          >
            {repo.private ? 'prywatne' : 'publiczne'}
          </Text>
        </View>
      </View>

      {repo.description ? (
        <Text style={[styles.desc, { color: c.textSecondary }]} numberOfLines={2}>
          {repo.description}
        </Text>
      ) : (
        <Text style={[styles.desc, { color: c.textSecondary, fontStyle: 'italic' }]}>
          Brak opisu
        </Text>
      )}

      <View style={styles.meta}>
        <Text style={[styles.metaText, { color: c.textSecondary }]}>
          {repo.language ?? '—'}
        </Text>
        <Text style={[styles.metaText, { color: c.textSecondary }]}>
          ★ {formatNumber(repo.stargazers_count)}
        </Text>
        <Text style={[styles.metaText, { color: c.textSecondary }]}>
          ⑂ {formatNumber(repo.forks_count)}
        </Text>
      </View>
      <Text style={[styles.updated, { color: c.textSecondary }]}>
        Aktualizacja: {formatDate(repo.updated_at)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  desc: {
    fontSize: 14,
    lineHeight: 20,
  },
  meta: {
    flexDirection: 'row',
    gap: 14,
    flexWrap: 'wrap',
  },
  metaText: {
    fontSize: 13,
    fontWeight: '600',
  },
  updated: {
    fontSize: 12,
  },
});
