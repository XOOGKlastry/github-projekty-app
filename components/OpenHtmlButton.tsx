import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { resolveAndOpenRepoHtml } from '@/lib/openHtml';
import { useThemeColors } from '@/lib/theme';
import type { GitHubRepo } from '@/lib/types';

type Variant = 'primary' | 'compact';

type Props = {
  token: string;
  repo: Pick<
    GitHubRepo,
    'name' | 'html_url' | 'default_branch' | 'owner'
  >;
  variant?: Variant;
};

export function OpenHtmlButton({ token, repo, variant = 'primary' }: Props) {
  const c = useThemeColors();
  const [loading, setLoading] = useState(false);

  const onPress = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      await resolveAndOpenRepoHtml({
        token,
        owner: repo.owner.login,
        name: repo.name,
        defaultBranch: repo.default_branch,
        githubHtmlUrl: repo.html_url,
      });
    } finally {
      setLoading(false);
    }
  }, [loading, token, repo]);

  if (variant === 'compact') {
    return (
      <Pressable
        onPress={(e) => {
          // Avoid triggering parent card navigation
          e?.stopPropagation?.();
          void onPress();
        }}
        disabled={loading}
        style={({ pressed }) => [
          styles.compact,
          {
            backgroundColor: c.tintSoft,
            borderColor: c.tint,
            opacity: pressed || loading ? 0.7 : 1,
          },
        ]}
        hitSlop={6}
      >
        {loading ? (
          <ActivityIndicator size="small" color={c.tint} />
        ) : (
          <Text style={[styles.compactText, { color: c.tint }]}>
            Otwórz HTML / Pages
          </Text>
        )}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={() => void onPress()}
      disabled={loading}
      style={({ pressed }) => [
        styles.primary,
        {
          backgroundColor: c.tint,
          opacity: pressed || loading ? 0.85 : 1,
        },
      ]}
    >
      {loading ? (
        <View style={styles.row}>
          <ActivityIndicator color="#fff" />
          <Text style={styles.primaryText}>Szukam HTML / Pages…</Text>
        </View>
      ) : (
        <Text style={styles.primaryText}>Otwórz HTML / Pages</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  compact: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    minHeight: 32,
    justifyContent: 'center',
  },
  compactText: {
    fontSize: 12,
    fontWeight: '700',
  },
});
